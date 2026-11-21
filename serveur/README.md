# Services serveur de La Répét'

Le site est statique et fonctionne seul dans le navigateur. Ce dossier contient les services facultatifs qui l'accompagnent.

| Dossier | Rôle | État |
|---|---|---|
| [`llm-proxy/`](llm-proxy/README.md) | proxy IA sans état (Cloudflare Worker) : garde la clé du fournisseur de modèle de langage, relaie les demandes du retour, de l'assistant et de l'aide au coach | prêt, testé avec un fetch simulé (`node tests/proxy.test.mjs`) et de bout en bout avec un faux fournisseur ; pas encore essayé avec une vraie clé |

Manque encore : un serveur de données (parcours, réponses envoyées, rapports, comptes coach), indispensable pour un usage sur deux appareils. Voir `docs/etat-fonctionnel.md`, section 9, et `docs/mise-en-ligne.md`.
