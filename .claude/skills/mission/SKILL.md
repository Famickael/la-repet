---
name: mission
description: Déléguer une partie du travail en cours à Codex et/ou Ministral via une issue GitHub « ai:mission », continuer à travailler en parallèle, puis récupérer, vérifier et intégrer leurs contributions. À utiliser quand l'utilisateur dit « lance une mission », « délègue à Codex », « demande un second avis », ou quand une sous-tâche isolée gagne à être faite en parallèle.
---

# Mission multi-IA

Je (Claude) reste l'orchestrateur : je travaille moi-même tout de suite, je délègue en parallèle, puis j'arbitre.
L'orchestrateur tourne sur le Mac mini de l'utilisateur et prend en charge toute issue ouverte portant le label `ai:mission` dans ses dépôts.

## 0. Mode local ou mode cloud
```bash
test -f ~/.config/ai-orchestrator/config.toml && echo local || echo cloud
```
- **local** (session sur le Mac mini) : `AIO` = `(cd ~/.local/share/ai-orchestrator && python3 -m aio …)`. Les étapes 3 et 4 utilisent `dispatch` et `wait`.
- **cloud** (session Claude Code web, autre machine) : pas d'`AIO`. L'orchestrateur prendra l'issue au prochain passage (≤ 1 min) **si le Mac mini est allumé**. Les étapes 3 et 4 suivent la variante cloud.
  Pour créer l'issue, utilise `gh` s'il est authentifié, sinon l'outil GitHub disponible dans la session.

## 1. Découper
- Ce que je fais moi-même, sur ma branche.
- Ce que je délègue, sur des fichiers **distincts** des miens :
  - `agent:codex` : développement isolé, tests, ou implémentation concurrente pour confronter deux solutions.
  - `agent:ministral` : variantes, classification, extraction, données de test (réponse en commentaire).
- Si rien ne gagne à être délégué, je ne crée pas de mission.

## 2. Créer l'issue
Vérifie le dépôt : `gh repo view --json nameWithOwner -q .nameWithOwner`.
Corps avec ces sections : `## Objectif`, `## Contexte` (fichiers concernés, pas tout le dépôt), `## Critères de réussite`, `## Hors périmètre`. Aucun secret.
Montre le titre, les agents et le corps à l'utilisateur et attends son accord, sauf s'il m'a déjà dit de lancer la mission.
```bash
for l in ai:mission agent:codex agent:ministral; do gh label create "$l" --force >/dev/null; done
gh issue create --title "<titre>" --body-file <fichier> --label ai:mission --label agent:codex
```

## 3. Réveiller les délégués
- **local** : `$AIO dispatch <owner/repo> <numéro>`. Si l'orchestrateur ne répond pas, il prendra l'issue au prochain passage (≤ 1 min) ; je le signale.
- **cloud** : rien à faire. Au bout de 2 minutes, je vérifie qu'un commentaire « ⏳ … prend la mission » est apparu. Sinon, je préviens l'utilisateur et j'avance deux causes probables :
  - le Mac mini est éteint ou l'orchestrateur est arrêté ;
  - l'issue a été créée par un compte non autorisé (par exemple un bot). L'utilisateur doit alors ajouter ce compte à `allowed_authors` et `trusted_comment_authors` dans `~/.config/ai-orchestrator/config.toml`. Le nom exact figure dans `~/Library/Logs/ai-orchestrator.log`.

## 4. Travailler, puis attendre en arrière-plan
Je fais ma part. Puis je lance en **arrière-plan** (Bash `run_in_background`) :
- **local** : `$AIO wait <owner/repo> <numéro> --timeout 3600`. La commande se termine quand tous les délégués ont fini (ou si la mission est bloquée) et affiche les PR et les commentaires.
- **cloud** : je surveille l'apparition du label d'état posé par l'orchestrateur :
  ```bash
  R=<owner/repo>; N=<numéro>; for i in $(seq 60); do gh issue view $N -R $R --json labels -q '.labels[].name' | grep -qE '^aio:(review|blocked)$' && break; sleep 60; done; gh issue view $N -R $R --comments
  ```
Je n'interroge pas GitHub en boucle autrement.

## 5. Arbitrer et intégrer
- Je lis chaque contribution (`gh pr diff <url>`, commentaires de l'issue) et je la teste.
- J'intègre ce qui est bon dans ma branche (`git fetch` puis `git checkout origin/ai/codex/issue-N -- <fichiers>`, merge ou réécriture), je rejette le reste en le justifiant.
- Je pousse vers la branche finale de la mission et j'ouvre ou mets à jour la PR vers la branche principale. **La fusion vers la branche principale reste à l'utilisateur.**
- Je commente l'issue avec mon arbitrage, je ferme les PR brouillons des délégués devenues inutiles, et je ferme l'issue.

## 6. Compte rendu
Agents réellement utilisés, apports retenus ou rejetés et pourquoi, tests lancés et résultat, limites, ce qui reste à valider.
