# Comptes de démonstration

Authentification simulée par session (réception / personnel).  
Code commun pour tous : **1234**

| Identifiant | Code | Rôle | Profil | Bureau |
|-------------|------|------|--------|--------|
| `reception01` | `1234` | Réception | Réception C2I principale | Accueil |
| `patrick` | `1234` | Personnel | Patrick Tshimanga (analyste) | Génie logiciel |
| `marie` | `1234` | Personnel | Marie Ilunga (développeuse) | Génie logiciel |
| `jean` | `1234` | Personnel | Jean Kabila (secrétariat) | Secrétariat |
| `david` | `1234` | Personnel | David Mutombo (chef de projet) | Génie logiciel |
| `alain` | `1234` | Personnel | Alain Kabongo (admin système) | Administration système |
| `junior` | `1234` | Personnel | Junior Kalala (technicien réseau) | Maintenance réseau |

Les codes sont stockés hachés en base. Ils ne sont jamais renvoyés par l’API.

## Recharger

```powershell
cd backend
C:\wamp64\bin\php\php8.2.13\php.exe bin/console doctrine:fixtures:load --group=demo --no-interaction
```
