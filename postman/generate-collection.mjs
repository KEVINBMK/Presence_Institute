import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const TEST_OK = [
  "pm.test('HTTP 2xx', () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));",
  'const json = pm.response.json();',
  "pm.test('success = true', () => pm.expect(json.success).to.eql(true));",
];

const SAVE_RDV = [
  'const json = pm.response.json();',
  'if (json.data?.id) pm.collectionVariables.set("rdvId", String(json.data.id));',
  'if (json.data?.reference) pm.collectionVariables.set("reference", json.data.reference);',
  'if (json.data?.personnel?.id) {',
  '  pm.collectionVariables.set("personnelId", String(json.data.personnel.id));',
  '  pm.environment.set("personnelId", String(json.data.personnel.id));',
  '}',
  'if (json.data?.usager?.id) pm.collectionVariables.set("usagerId", String(json.data.usager.id));',
  'if (json.data?.bureau?.id) pm.collectionVariables.set("bureauId", String(json.data.bureau.id));',
];

const SAVE_RDV_USAGER = [
  'const json = pm.response.json();',
  'if (json.data?.id) pm.collectionVariables.set("rdvId", String(json.data.id));',
  'if (json.data?.reference) pm.collectionVariables.set("reference", json.data.reference);',
  'if (json.data?.bureau?.id) pm.collectionVariables.set("bureauId", String(json.data.bureau.id));',
];

const TEST_NO_PERSONNEL_USAGER = [
  "pm.test('réponse usager sans personnel nominatif', () => {",
  '  pm.expect(json.data.personnel).to.be.undefined;',
  "  pm.expect(json.data).to.not.have.property('personnel');",
  '});',
];

const INIT_VARS = [
  "const today = new Date().toISOString().split('T')[0];",
  "pm.collectionVariables.set('today', today);",
  "pm.environment.set('today', today);",
  "const phone = '06' + String(Date.now()).slice(-8);",
  "pm.collectionVariables.set('uniquePhone', phone);",
  "pm.environment.set('uniquePhone', phone);",
];

function req(name, method, url, opts = {}) {
  const item = {
    name,
    request: {
      method,
      header: opts.headers || [],
      url: typeof url === 'string' ? url : url,
      description: opts.description || '',
    },
  };
  if (opts.body) {
    item.request.header.push({ key: 'Content-Type', value: 'application/json' });
    item.request.body = { mode: 'raw', raw: opts.body };
  }
  if (opts.events?.length) item.event = opts.events;
  return item;
}

function folder(name, description, items) {
  return { name, description, item: items };
}

function testEvent(exec) {
  return [{ listen: 'test', script: { type: 'text/javascript', exec } }];
}

function preEvent(exec) {
  return [{ listen: 'prerequest', script: { type: 'text/javascript', exec } }];
}

function both(pre, test) {
  const e = [];
  if (pre) e.push(...preEvent(pre));
  if (test) e.push(...testEvent(test));
  return e;
}

const base = '{{baseUrl}}';

const SAVE_FIRST_BUREAU = [
  'const list = pm.response.json().data || [];',
  'if (list.length) {',
  '  const id = String(list[0].id);',
  '  pm.collectionVariables.set("bureauId", id);',
  '  pm.environment.set("bureauId", id);',
  '}',
];

/** Remplit bureauId via GET /api/bureaux si la variable est vide (évite /api/bureaux//creneaux). */
const ENSURE_BUREAU = [
  "const base = pm.collectionVariables.get('baseUrl') || 'http://127.0.0.1:8000';",
  "let bureauId = pm.collectionVariables.get('bureauId') || pm.environment.get('bureauId');",
  "if (!bureauId || String(bureauId).trim() === '') {",
  "  const res = pm.sendRequest({ url: base + '/api/bureaux', method: 'GET', header: { Accept: 'application/json' } });",
  "  const list = res.json().data || [];",
  "  if (!list.length) throw new Error('Aucun bureau actif — lancez doctrine:fixtures:load --group=demo');",
  "  bureauId = String(list[0].id);",
  "  pm.collectionVariables.set('bureauId', bureauId);",
  "  pm.environment.set('bureauId', bureauId);",
  "} else {",
  "  pm.collectionVariables.set('bureauId', String(bureauId));",
  "}",
  "if (!pm.collectionVariables.get('today')) {",
  "  const today = new Date().toISOString().split('T')[0];",
  "  pm.collectionVariables.set('today', today);",
  "  pm.environment.set('today', today);",
  '}',
];

const reference = folder('Référence', 'Requêtes isolées pour tester une route.', [
  req('GET Bureaux actifs', 'GET', `${base}/api/bureaux`, {
    events: both(INIT_VARS, [...TEST_OK, ...SAVE_FIRST_BUREAU]),
  }),
  req('GET Créneaux bureau', 'GET', `${base}/api/bureaux/{{bureauId}}/creneaux?date={{today}}`, {
    events: both([...ENSURE_BUREAU], [...TEST_OK]),
    description: 'bureauId auto si vide (script pré-requête).',
  }),
  req('POST Demande rendez-vous', 'POST', `${base}/api/rendez-vous`, {
    body: `{
  "nom": "Test",
  "prenom": "Ref",
  "telephone": "{{uniquePhone}}",
  "typeUsager": "CITOYEN",
  "bureauId": {{bureauId}},
  "dateSouhaitee": "{{today}}",
  "motif": "Test référence"
}`,
    events: both([...INIT_VARS, ...ENSURE_BUREAU], [...TEST_OK, ...SAVE_RDV]),
  }),
  req('GET RDV par référence', 'GET', `${base}/api/rendez-vous/reference/{{reference}}`, {
    events: testEvent([...TEST_OK]),
  }),
  req('GET RDV du jour (réception)', 'GET', `${base}/api/reception/rendez-vous-du-jour`, {
    events: testEvent([...TEST_OK]),
  }),
  req('GET Recherche réception', 'GET', `${base}/api/reception/recherche?query={{uniquePhone}}`, {
    events: testEvent([...TEST_OK]),
  }),
  req('GET Notifications réception', 'GET', `${base}/api/reception/notifications`, {
    events: testEvent([...TEST_OK]),
  }),
]);

const soumission = folder(
  'Soumission demande usager',
  'POST demande — planification auto (CONFIRME ou DEMANDE). Sans heureDebut ni personnel nominatif côté usager.',
  [
    req('1. Initialiser date et téléphone', 'GET', `${base}/api/bureaux`, {
      description: 'Ping + variables today / uniquePhone / bureauId',
      events: both(INIT_VARS, [...TEST_OK, ...SAVE_FIRST_BUREAU]),
    }),
    req('2. Soumettre demande', 'POST', `${base}/api/rendez-vous`, {
      body: `{
  "nom": "Demande",
  "prenom": "Usager",
  "telephone": "{{uniquePhone}}",
  "email": "demande@demo.c2i.cd",
  "typeUsager": "CITOYEN",
  "bureauId": {{bureauId}},
  "dateSouhaitee": "{{today}}",
  "periodeSouhaitee": "MATIN",
  "fonctionSouhaitee": "Technicien",
  "motif": "Soumission demande — test planification"
}`,
      events: both(ENSURE_BUREAU, [
        "pm.test('HTTP 2xx', () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));",
        'const json = pm.response.json();',
        "pm.test('success = true', () => pm.expect(json.success).to.eql(true));",
        ...SAVE_RDV_USAGER.slice(1),
        ...TEST_NO_PERSONNEL_USAGER,
        "pm.test('fonctionSouhaitee renvoyée', () => pm.expect(json.data.fonctionSouhaitee).to.eql('Technicien'));",
        "pm.test('statut CONFIRME ou DEMANDE', () => pm.expect(['CONFIRME','DEMANDE']).to.include(json.data.statut));",
      ]),
    }),
  ],
);

const scenario1 = folder('Scénario 1 — Usager : demander un RDV', 'Bureaux → soumettre demande → consulter par référence.', [
  req('1.1 Initialiser date et téléphone unique', 'GET', `${base}/api/bureaux`, {
    events: both(INIT_VARS, [...TEST_OK, ...SAVE_FIRST_BUREAU]),
  }),
  req('1.2 Lister bureaux', 'GET', `${base}/api/bureaux`, {
    events: testEvent([...TEST_OK]),
  }),
  req('1.3 Soumettre demande', 'POST', `${base}/api/rendez-vous`, {
    body: `{
  "nom": "Scenario",
  "prenom": "Postman",
  "telephone": "{{uniquePhone}}",
  "email": "scenario@example.com",
  "typeUsager": "CITOYEN",
  "bureauId": {{bureauId}},
  "dateSouhaitee": "{{today}}",
  "motif": "Scénario 1 — demande usager"
}`,
    events: both(ENSURE_BUREAU, [
      ...TEST_OK,
      ...SAVE_RDV,
      "const j=pm.response.json();",
      "pm.test('planif',()=>pm.expect(['CONFIRME','DEMANDE']).to.include(j.data.statut));",
    ]),
  }),
  req('1.4 Consulter par référence', 'GET', `${base}/api/rendez-vous/reference/{{reference}}`, {
    events: testEvent([...TEST_OK]),
  }),
]);

const scenario2 = folder('Scénario 2 — Réception : arrivée et visite', 'Après scénario 1 (rdvId CONFIRME).', [
  req('2.1 RDV du jour', 'GET', `${base}/api/reception/rendez-vous-du-jour`, {
    events: testEvent([...TEST_OK]),
  }),
  req('2.2 Enregistrer arrivée', 'POST', `${base}/api/reception/rendez-vous/{{rdvId}}/arrivee`, {
    events: testEvent([...TEST_OK, ...SAVE_RDV]),
  }),
  req('2.3 Ouvrir visite', 'POST', `${base}/api/reception/visites`, {
    body: JSON.stringify({ usagerId: '{{usagerId}}', receptionId: 1, rendezVousIds: ['{{rdvId}}'] }, null, 2),
    events: testEvent([
      ...TEST_OK,
      'const j=pm.response.json();',
      'if (j.data?.id) pm.collectionVariables.set("visiteId", String(j.data.id));',
      'if (j.data?.reference) pm.collectionVariables.set("visiteReference", j.data.reference);',
    ]),
  }),
  req('2.4 Détail visite', 'GET', `${base}/api/reception/visites/{{visiteId}}`, {
    events: testEvent([...TEST_OK]),
  }),
  req('2.5 Orienter usager', 'PATCH', `${base}/api/reception/visites/{{visiteId}}/orienter`, {
    body: JSON.stringify({ personnelId: '{{personnelId}}', rendezVousId: '{{rdvId}}' }, null, 2),
    events: testEvent([...TEST_OK]),
  }),
]);

const scenario3 = folder('Scénario 3 — Personnel : prise en charge', 'Après orientation (scénario 2).', [
  req('3.1 Liste RDV personnel', 'GET', `${base}/api/personnel/{{personnelId}}/rendez-vous`, {
    events: testEvent([...TEST_OK]),
  }),
  req('3.2 Démarrer prise en charge', 'PATCH', `${base}/api/personnel/{{personnelId}}/rendez-vous/{{rdvId}}/demarrer`, {
    events: testEvent([...TEST_OK, ...SAVE_RDV]),
  }),
  req('3.3 Clôturer prise en charge', 'PATCH', `${base}/api/personnel/{{personnelId}}/rendez-vous/{{rdvId}}/cloturer`, {
    events: testEvent([
      ...TEST_OK,
      ...SAVE_RDV,
      "const j=pm.response.json();",
      "if (j.data?.statut) pm.test('TERMINE', () => pm.expect(j.data.statut).to.eql('TERMINE'));",
    ]),
  }),
  req('3.4 Notifications réception', 'GET', `${base}/api/reception/notifications`, {
    events: testEvent([
      ...TEST_OK,
      "const items = pm.response.json().data || [];",
      "pm.test('notification FIN_PRISE_EN_CHARGE', () => {",
      "  const found = items.some(n => n.type === 'FIN_PRISE_EN_CHARGE');",
      "  pm.expect(found).to.be.true;",
      "});",
      "const fin = items.find(n => n.type === 'FIN_PRISE_EN_CHARGE');",
      "if (fin?.id) pm.collectionVariables.set('notificationId', String(fin.id));",
    ]),
  }),
]);

const scenario4 = folder('Scénario 4 — Réception : décision et clôture', 'Après notification personnel.', [
  req('4.1 Décision CONTINUER', 'PATCH', `${base}/api/reception/visites/{{visiteId}}/decision`, {
    body: JSON.stringify({ decision: 'CONTINUER' }, null, 2),
    events: testEvent([...TEST_OK]),
  }),
  req('4.2 Historique visite', 'GET', `${base}/api/visites/{{visiteId}}/historique`, {
    events: testEvent([...TEST_OK]),
  }),
  req('4.3 Marquer notification lue', 'PATCH', `${base}/api/notifications/{{notificationId}}/lire`, {
    events: testEvent([...TEST_OK]),
  }),
  req('4.4 Traiter notification', 'PATCH', `${base}/api/notifications/{{notificationId}}/traiter`, {
    events: testEvent([...TEST_OK]),
  }),
  req('4.5 Clôturer visite', 'PATCH', `${base}/api/reception/visites/{{visiteId}}/cloturer`, {
    events: testEvent([...TEST_OK]),
  }),
]);

const scenario5 = folder(
  'Scénario 5 — COMPLET',
  'Parcours dynamique bout en bout (hors fixtures DEMO). Run ce dossier après API + base vide ou rechargée.',
  [
    ...scenario1.item,
    ...scenario2.item,
    ...scenario3.item,
    ...scenario4.item,
  ],
);

const scenario6 = folder('Scénario 6 — Usager annule un RDV', 'Indépendant.', [
  req('6.1 Initialiser', 'GET', `${base}/api/bureaux`, {
    events: both(
      [
        ...INIT_VARS,
        "pm.collectionVariables.set('futureDate', new Date(Date.now()+86400000*7).toISOString().split('T')[0]);",
      ],
      [...TEST_OK, ...SAVE_FIRST_BUREAU],
    ),
  }),
  req('6.2 Créer RDV futur', 'POST', `${base}/api/rendez-vous`, {
    body: `{
  "nom": "Annule",
  "prenom": "Test",
  "telephone": "{{uniquePhone}}",
  "typeUsager": "CITOYEN",
  "bureauId": {{bureauId}},
  "dateSouhaitee": "{{futureDate}}",
  "motif": "RDV à annuler"
}`,
    events: both(ENSURE_BUREAU, [...TEST_OK, ...SAVE_RDV]),
  }),
  req('6.3 Annuler RDV', 'PATCH', `${base}/api/rendez-vous/{{rdvId}}/annuler`, {
    events: testEvent([
      ...TEST_OK,
      "pm.test('ANNULE', () => pm.expect(pm.response.json().data.statut).to.eql('ANNULE'));",
    ]),
  }),
]);

const demoA3Test = [
  ...TEST_OK,
  "const hist = pm.response.json().data || [];",
  "const types = hist.map(h => h.typeAction);",
  "pm.test('historique non vide', () => pm.expect(hist.length).to.be.above(0));",
  "pm.test('PRISE_EN_CHARGE_CLOTUREE', () => pm.expect(types).to.include('PRISE_EN_CHARGE_CLOTUREE'));",
];

const demo = folder(
  'Scénario DEMO — Données fixtures A–F (prioritaire)',
  'Soutenance : charger `php bin/console doctrine:fixtures:load --group=demo` avant Run.',
  [
    req('A.1 Rechercher usager scénario A', 'GET', `${base}/api/reception/recherche?query={{usagerTelScenarioA}}`, {
      events: testEvent([...TEST_OK]),
    }),
    req('A.2 RDV par référence A', 'GET', `${base}/api/rendez-vous/reference/{{rdvRefScenarioA}}`, {
      events: testEvent([
        ...TEST_OK,
        "pm.test('RDV TERMINE', () => pm.expect(pm.response.json().data.statut).to.eql('TERMINE'));",
      ]),
    }),
    req('A.3 Historique visite A', 'GET', `${base}/api/visites/reference/{{visiteRefScenarioA}}/historique`, {
      events: testEvent(demoA3Test),
    }),
    req('B.1 Rechercher usager scénario B', 'GET', `${base}/api/reception/recherche?query={{usagerTelScenarioB}}`, {
      events: testEvent([
        ...TEST_OK,
        "pm.test('au moins 3 RDV même jour', () => pm.expect(pm.response.json().data.length).to.be.at.least(3));",
        "const rdvs = pm.response.json().data || [];",
        "const genie = rdvs.filter(r => r.bureau.nom === 'Bureau Génie Logiciel');",
        "pm.test('même bureau Génie Logiciel', () => pm.expect(genie.length).to.be.at.least(3));",
        "const persos = new Set(genie.map(r => r.personnel?.id).filter(Boolean));",
        "pm.test('personnels différents', () => pm.expect(persos.size).to.be.at.least(2));",
      ]),
    }),
    req('B.2 Notifications FIN_PRISE_EN_CHARGE', 'GET', `${base}/api/reception/notifications`, {
      events: testEvent([
        ...TEST_OK,
        "const items = pm.response.json().data || [];",
        "pm.test('FIN_PRISE_EN_CHARGE', () => {",
        "  pm.expect(items.some(n => n.type === 'FIN_PRISE_EN_CHARGE')).to.be.true;",
        "});",
      ]),
    }),
    req('C.1 Rechercher usager scénario C', 'GET', `${base}/api/reception/recherche?query={{usagerTelScenarioC}}`, {
      events: testEvent([
        ...TEST_OK,
        'const rdvs = pm.response.json().data || [];',
        "const r = rdvs.find(x => x.reference === 'RDV-2026-000005');",
        "if (r?.personnel?.id) {",
        "  pm.collectionVariables.set('personnelId', String(r.personnel.id));",
        "  pm.environment.set('personnelId', String(r.personnel.id));",
        '}',
        "pm.test('RDV ARRIVE', () => pm.expect(r?.statut).to.eql('ARRIVE'));",
      ]),
    }),
    req('C.2 PATCH disponibilité personnel', 'PATCH', `${base}/api/personnel/{{personnelId}}/disponibilite`, {
      body: JSON.stringify(
        {
          disponibiliteOperationnelle: 'NON_DISPONIBLE_POUR_RECEPTION',
          motifNonReception: 'Indisponible pour démo Postman',
        },
        null,
        2,
      ),
      events: testEvent([
        ...TEST_OK,
        "pm.test('NON_DISPONIBLE', () => pm.expect(pm.response.json().data.disponibiliteOperationnelle).to.eql('NON_DISPONIBLE_POUR_RECEPTION'));",
      ]),
    }),
    req('D — Retard (recherche)', 'GET', `${base}/api/reception/recherche?query={{usagerTelScenarioD}}`, {
      events: testEvent([...TEST_OK]),
    }),
    req('E — Non présenté', 'GET', `${base}/api/rendez-vous/reference/RDV-2026-000007`, {
      events: testEvent([
        ...TEST_OK,
        "pm.test('NON_PRESENTE', () => pm.expect(pm.response.json().data.statut).to.eql('NON_PRESENTE'));",
      ]),
    }),
    req('F — Annulation', 'GET', `${base}/api/rendez-vous/reference/RDV-2026-000008`, {
      events: testEvent([
        ...TEST_OK,
        "pm.test('ANNULE', () => pm.expect(pm.response.json().data.statut).to.eql('ANNULE'));",
      ]),
    }),
  ],
);

const multiRdvBureau = folder(
  'Usager — plusieurs RDV même bureau',
  'Scénario B : 0890000002, 3 RDV Bureau Génie Logiciel, personnels distincts.',
  [
    req('1. GET personnels démo', 'GET', `${base}/api/personnel`, {
      events: testEvent([
        ...TEST_OK,
        "pm.test('10 personnels', () => pm.expect(pm.response.json().data.length).to.eql(10));",
      ]),
    }),
    req('2. Recherche usager B', 'GET', `${base}/api/reception/recherche?query={{usagerTelScenarioB}}`, {
      events: testEvent([
        ...TEST_OK,
        "const rdvs = pm.response.json().data;",
        "pm.test('3 RDV', () => pm.expect(rdvs.length).to.eql(3));",
        "pm.test('B1 TERMINE', () => pm.expect(rdvs.find(r => r.reference === 'RDV-2026-000002').statut).to.eql('TERMINE'));",
        "pm.test('B2 ARRIVE', () => pm.expect(rdvs.find(r => r.reference === 'RDV-2026-000003').statut).to.eql('ARRIVE'));",
      ]),
    }),
    req('3. Visite active usager B', 'GET', `${base}/api/reception/visites/active?query={{usagerTelScenarioB}}`, {
      events: testEvent([
        ...TEST_OK,
        "pm.test('visite EN_COURS', () => pm.expect(pm.response.json().data.statut).to.eql('EN_COURS'));",
        "pm.test('3 RDV liés', () => pm.expect(pm.response.json().data.rendezVous.length).to.eql(3));",
      ]),
    }),
    req('4. Notifications réception', 'GET', `${base}/api/reception/notifications`, {
      events: testEvent([
        ...TEST_OK,
        "const items = pm.response.json().data || [];",
        "pm.test('FIN_PRISE_EN_CHARGE', () => pm.expect(items.some(n => n.type === 'FIN_PRISE_EN_CHARGE')).to.be.true);",
      ]),
    }),
  ],
);

const volume = folder('Volume / recherche', 'Après fixtures volume. Listes et recherche.', [
  req('Recherche volume', 'GET', `${base}/api/reception/recherche?query=089`, {
    events: testEvent([...TEST_OK]),
  }),
  req('RDV du jour', 'GET', `${base}/api/reception/rendez-vous-du-jour`, {
    events: testEvent([...TEST_OK]),
  }),
]);

const collection = {
  info: {
    name: 'Atelier — Gestion rendez-vous',
    description:
      "## Démarrer l'API\n```powershell\ncd backend\nphp bin/console doctrine:fixtures:load --group=demo --no-interaction\nphp -S 127.0.0.1:8000 -t public\n```\n\n## Importer\n1. Cette collection\n2. `Atelier-local.postman_environment.json`\n\n## Soutenance\n**Run folder** → **Scénario DEMO — Données fixtures A–F (prioritaire)**\n\n## Usager (nouvelle règle)\n**Soumission demande usager** — POST sans `heureDebut`.",
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  event: [
    {
      listen: 'prerequest',
      script: {
        type: 'text/javascript',
        exec: [
          "if (!pm.collectionVariables.get('baseUrl')) {",
          "  pm.collectionVariables.set('baseUrl', 'http://127.0.0.1:8000');",
          '}',
        ],
      },
    },
  ],
  variable: [
    { key: 'baseUrl', value: 'http://127.0.0.1:8000' },
    { key: 'today', value: '' },
    { key: 'uniquePhone', value: '0600000001' },
    { key: 'bureauId', value: '' },
    { key: 'rdvId', value: '4' },
    { key: 'reference', value: '' },
    { key: 'visiteId', value: '1' },
    { key: 'usagerId', value: '1' },
    { key: 'personnelId', value: '1' },
    { key: 'notificationId', value: '1' },
    { key: 'heureDebut', value: '14:00' },
    { key: 'futureDate', value: '' },
    { key: 'visiteReference', value: '' },
    { key: 'rdvRefScenarioA', value: 'RDV-2026-000001' },
    { key: 'rdvRefScenarioB1', value: 'RDV-2026-000002' },
    { key: 'rdvRefScenarioB2', value: 'RDV-2026-000003' },
    { key: 'rdvRefScenarioB3', value: 'RDV-2026-000004' },
    { key: 'visiteRefScenarioA', value: 'VIS-2026-000001' },
    { key: 'visiteRefScenarioB', value: 'VIS-2026-000002' },
    { key: 'usagerTelScenarioA', value: '0890000001' },
    { key: 'usagerTelScenarioB', value: '0890000002' },
    { key: 'usagerTelScenarioC', value: '0890000003' },
    { key: 'usagerTelScenarioD', value: '0890000004' },
    { key: 'usagerTelScenarioE', value: '0890000005' },
    { key: 'usagerTelScenarioF', value: '0890000006' },
  ],
  item: [reference, soumission, scenario1, scenario2, scenario3, scenario4, scenario5, scenario6, demo, multiRdvBureau, volume],
};

const environment = {
  name: 'Atelier — Local',
  values: [
    { key: 'baseUrl', value: 'http://127.0.0.1:8000', enabled: true },
    { key: 'today', value: '', enabled: true },
    { key: 'rdvId', value: '1', enabled: true },
    { key: 'visiteId', value: '1', enabled: true },
    { key: 'personnelId', value: '1', enabled: true },
    { key: 'usagerId', value: '1', enabled: true },
    { key: 'bureauId', value: '', enabled: true },
    { key: 'reference', value: 'RDV-2026-000001', enabled: true },
    { key: 'uniquePhone', value: '0600000001', enabled: true },
    { key: 'heureDebut', value: '09:00', enabled: true },
    { key: 'notificationId', value: '1', enabled: true },
    { key: 'rdvRefScenarioA', value: 'RDV-2026-000001', enabled: true },
    { key: 'rdvRefScenarioB1', value: 'RDV-2026-000002', enabled: true },
    { key: 'rdvRefScenarioB2', value: 'RDV-2026-000003', enabled: true },
    { key: 'rdvRefScenarioB3', value: 'RDV-2026-000004', enabled: true },
    { key: 'visiteRefScenarioA', value: 'VIS-2026-000001', enabled: true },
    { key: 'visiteRefScenarioB', value: 'VIS-2026-000002', enabled: true },
    { key: 'usagerTelScenarioA', value: '0890000001', enabled: true },
    { key: 'usagerTelScenarioB', value: '0890000002', enabled: true },
    { key: 'usagerTelScenarioC', value: '0890000003', enabled: true },
    { key: 'usagerTelScenarioD', value: '0890000004', enabled: true },
    { key: 'usagerTelScenarioE', value: '0890000005', enabled: true },
    { key: 'usagerTelScenarioF', value: '0890000006', enabled: true },
  ],
  _postman_variable_scope: 'environment',
};

writeFileSync(join(__dirname, 'Atelier-API.postman_collection.json'), JSON.stringify(collection, null, 2));
writeFileSync(join(__dirname, 'Atelier-local.postman_environment.json'), JSON.stringify(environment, null, 2));
console.log('OK: collection + environment générés.');
