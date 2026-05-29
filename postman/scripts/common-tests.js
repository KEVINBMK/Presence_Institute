// Scripts copiés dans la collection Postman (référence locale).
// testSuccess() — vérifie status + success:true
// saveRdvFromResponse() — enregistre rdvId, reference, personnelId, usagerId

function testSuccess() {
    pm.test('HTTP 2xx', () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));
    const json = pm.response.json();
    pm.test('success = true', () => pm.expect(json.success).to.eql(true));
    return json;
}

function saveRdvFromResponse(json) {
    const d = json.data;
    if (d.id) pm.collectionVariables.set('rdvId', String(d.id));
    if (d.reference) pm.collectionVariables.set('reference', d.reference);
    if (d.personnel?.id) pm.collectionVariables.set('personnelId', String(d.personnel.id));
    if (d.usager?.id) pm.collectionVariables.set('usagerId', String(d.usager.id));
    if (d.bureau?.id) pm.collectionVariables.set('bureauId', String(d.bureau.id));
}

function saveVisiteFromResponse(json) {
    const d = json.data;
    if (d.id) pm.collectionVariables.set('visiteId', String(d.id));
    if (d.reference) pm.collectionVariables.set('visiteReference', d.reference);
}

function setTodayAndUniquePhone() {
    const today = new Date().toISOString().split('T')[0];
    pm.collectionVariables.set('today', today);
    const phone = '06' + String(Date.now()).slice(-8);
    pm.collectionVariables.set('uniquePhone', phone);
}
