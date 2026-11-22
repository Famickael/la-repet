# Instructions Claude Code

Lire d'abord `AGENTS.md` (règles communes à tous les agents IA, file de missions, branches), puis `README.md`, en particulier les sections « Règles de conception à respecter », « Passage en production » et « Reprise du travail avec Claude Code », et `docs/design-system.md` avant toute modification d'interface.

- Vérifier chaque changement avec `npm run build`, `npm run test:analysis`, `node tests/assistant.test.mjs`, `npm run test:design` (référentiel UI/UX, bloquant) et, si l’environnement le permet, `npm run test:e2e` (aussi avec `E2E_VIEWPORT=390x844`).
- Ne jamais introduire de note, de score ni d’inférence émotionnelle (voir `src/lib/analysis.js`, `isCompliant`).
- Textes d’interface en français, sans tiret cadratin.
- Décisions du propriétaire (22 novembre 2026), à respecter sans les rediscuter :
  - Projet personnel de démonstration, mais le site se présente comme une version **pleinement fonctionnelle** : aucun texte visible ne dit « version d'essai », « démonstration », « prototype », « dans ce navigateur », « sur ce site » ou « en mode local ». On écrit simplement ce qui se passe (« Votre coach lit votre entretien »). Seules exceptions : le code d'essai REPETE et les identifiants coach préremplis, et le message du formulaire de contact « Aucune demande envoyée, version de démonstration ».
  - L'unité enregistrée, envoyée, relue, gardée ou supprimée s'appelle **« entretien »** partout (personne accompagnée, coach, pages publiques, FAQ), pas « réponse » ni « prise ». On répond toujours à une question, mais ce qu'on enregistre et envoie est un entretien.
  - Pour l'IA, on dit qu'elle **« analyse »** l'entretien (pas « décrit »), toujours sans note, sans score et sans inférence d'émotion.
- Missions pour Codex : ouvrir une issue par mission, titre commençant par `[Codex]`, avec contexte, résultat attendu, fichiers concernés, critères de validation et hors périmètre (voir `AGENTS.md`, section 4). Relire ensuite la pull request de Codex avant toute fusion.
