# Brief ChatGPT : articles du centre de ressources

Ce brief explique comment écrire et publier de nouveaux articles pour le centre de ressources de La Répét' (pages `#/ressources`). Chaque article est un fichier Markdown autonome : aucun composant n'est à modifier.

## 1. Le contexte en trois phrases

La Répét' est l'outil d'entraînement aux entretiens d'un organisme d'accompagnement : elle n'est pas vendue comme un logiciel, elle outille l'accompagnement que l'organisme mène pour des commanditaires publics (retour à l'emploi, insertion) ou privés (mobilité et évolution des collaborateurs). La personne accompagnée, demandeur d'emploi ou collaborateur d'entreprise, s'entraîne seule face à sa caméra, un assistant décrit sa réponse **sans jamais la noter**, puis un coach de l'organisme relit ce qu'on lui envoie et prépare un débriefing. Les lecteurs sont des personnes en recherche d'emploi ou en mobilité (souvent peu à l'aise avec l'exercice), des coachs, et des commanditaires (acteurs publics de l'emploi, entreprises). Ne jamais nommer le fournisseur du modèle d'IA : on écrit « assistant IA ».

## 2. Où et comment déposer un article

- Dossier : `src/content/resources/`
- Nom du fichier : `<slug>.md`, où le slug est le titre court en minuscules, sans accents, mots séparés par des tirets (`a-z`, `0-9`, `-`). Exemple : `preparer-un-entretien-telephonique.md`. Le slug devient l'adresse : `#/ressources/preparer-un-entretien-telephonique`.
- Image d'en-tête : `public/img/ressources/<slug>.webp`, 1200 × 630 px, 150 Ko maximum (voir `docs/briefs/chatgpt-images.md`). Sans image, la carte affiche un fond neutre : ce n'est pas bloquant, mais prévoyez-la.
- Encodage UTF-8, fins de ligne Unix.

## 3. Les catégories (champ `category`)

| Identifiant | Titre affiché | Pour quoi |
|---|---|---|
| `preparer` | Préparer son entretien | Se présenter, parler de ses expériences, trac, tenue, venue, recherches sur l'employeur |
| `questions` | Questions de recruteurs | Questions fréquentes, questions difficiles, questions à poser, questions interdites |
| `visio` | Entretien en visio | Matériel, cadre, regard, téléphone, entretien différé enregistré |
| `guides` | Guides La Répét' | Prise en main de l'outil côté personne accompagnée |
| `coachs` | Pour les coachs | Parcours, relecture, notes horodatées, animation d'atelier, débriefing |
| `commanditaires` | Pour les commanditaires | Confier un accompagnement (acteurs publics, entreprises), publics accompagnés, confidentialité, bilan d'ensemble, cadre juridique. Pas de discours de logiciel, de tarif ni de licence |

Une nouvelle catégorie demande une modification du code (`CATEGORIES` dans `src/content/resources.js`) : ne pas en créer sans accord.

## 4. Les deux types d'article (champ `type`)

### 4.1 `guide` : article de blog classique

Mise en page : fil d'Ariane, titre, résumé, auteur, date, temps de lecture, image d'en-tête, **sommaire automatique** construit à partir des titres `##` (colonne de gauche), corps, articles liés, appel à l'action vers « Mon espace ».

Structure type :
1. Une introduction de 2 à 4 phrases, sans titre : la situation du lecteur et ce qu'il va trouver.
2. 3 à 6 sections `##`, chacune avec des conseils concrets (listes, exemple, encadré).
3. Un encadré `[!a-retenir]` en fin d'article, ou une section « S'entraîner avec La Répét' » qui relie le conseil à l'outil sans survendre.

### 4.2 `cas` : scénario d'usage (format étude de cas)

Mise en page : titre, image, résumé, puis une **colonne de faits clés** (Contexte, Public, Durée, Dispositif, avec la mention « Scénario type » ajoutée automatiquement), corps, articles liés, appel à l'action vers « Demander une démo ».

Structure imposée du corps, avec ces titres exacts :
1. Une phrase d'introduction qui dit clairement que le scénario est **fictif**.
2. `## Le défi` : la situation de départ.
3. `## La démarche` : comment l'outil est utilisé, étape par étape.
4. `## Ce qui a changé` : les effets **formulés au conditionnel**, de façon qualitative (« pourraient », « seraient attendus », « à vérifier sur le terrain »).
5. Un encadré `[!attention] Points de vigilance`.
6. `## Pour aller plus loin` : un lien vers un guide existant.

Champs d'en-tête supplémentaires obligatoires pour un `cas` : `context`, `audience`, `duration`, `setup`.

> **Règle absolue pour les scénarios d'usage.** Aucun chiffre, aucun résultat mesuré, aucune citation, aucun nom d'organisme ni de personne inventés présentés comme réels. L'organisation est toujours fictive et générique (« un organisme d'accompagnement de taille moyenne », « une antenne en zone rurale »). Les effets sont qualitatifs et au conditionnel. Un propos cité doit être signalé comme illustratif dans son intitulé (`> [!citation] Propos illustratif d'une coach`).

## 5. Format exact du fichier

```markdown
---
title: Préparer un entretien téléphonique
category: visio
type: guide
summary: Une ou deux phrases (160 caractères environ) qui donnent envie de lire et résument le bénéfice.
image: ressources/preparer-un-entretien-telephonique.webp
imageAlt: Description factuelle de l'image pour les lecteurs d'écran, en une phrase.
date: 2026-12-01
readingTime: 6
author: Équipe La Répét'
featured: false
order: 20
---

Introduction de deux à quatre phrases.

## Premier titre de section

Un paragraphe. Le **gras** met en avant une idée clé, l'*italique* reste rare.

- un élément de liste ;
- un autre élément, avec un [lien interne](#/ressources/reussir-un-entretien-en-visio).

1. Une étape numérotée.
2. Une autre étape.

> [!conseil] Titre facultatif de l'encadré
> Le texte de l'encadré, sur une ou plusieurs lignes commençant par « > ».

> [!exemple] Une réponse possible
> « Une phrase d'exemple, au vouvoiement si c'est une réplique de recruteur. »

> [!attention] Point d'attention
> Ce à quoi il faut faire attention.

> [!a-retenir] À retenir
> - Point 1.
> - Point 2.
```

Champs de l'en-tête :

| Champ | Obligatoire | Règle |
|---|---|---|
| `title` | oui | 70 caractères maximum, sans point final |
| `category` | oui | un identifiant de la section 3 |
| `type` | oui | `guide` ou `cas` |
| `summary` | oui | 1 ou 2 phrases, 200 caractères maximum |
| `image` | oui | `ressources/<slug>.webp` |
| `imageAlt` | oui | décrit l'image, pas l'article |
| `date` | oui | `AAAA-MM-JJ` |
| `readingTime` | non | en minutes ; calculé automatiquement s'il manque (200 mots par minute) |
| `author` | oui | toujours `Équipe La Répét'` |
| `featured` | non | `true` pour « À la une » (3 articles affichés au plus) ; laisser `false` par défaut |
| `order` | non | ordre d'affichage, croissant ; les articles existants vont de 1 à 11 |
| `context`, `audience`, `duration`, `setup` | pour `cas` | une phrase courte chacun |

Une valeur ne doit pas commencer par un guillemet droit `"` ni contenir de retour à la ligne.

Syntaxe Markdown reconnue (et seulement celle-ci) : titres `##` et `###` (pas de `#`, le titre de page vient de `title`), paragraphes, listes `-` et `1.`, gras `**…**`, italique `*…*`, liens `[texte](adresse)`, encadrés `> [!conseil]`, `> [!exemple]`, `> [!attention]`, `> [!a-retenir]`, citation `> [!citation] Intitulé` ou `> texte`. Pas de tableau, pas d'image dans le corps, pas de HTML.

Liens internes utiles : `#/ressources/<slug>`, `#/ressources/c/<categorie>`, `#/espace` (Mon espace), `#/solutions`, `#/a-propos/faq`, `#/demo`.

## 6. Règles éditoriales

1. **Français**, phrases courtes, vocabulaire courant. Viser un niveau de lecture accessible à toutes et tous, y compris aux personnes peu à l'aise avec l'écrit.
2. **Vouvoiement** du lecteur, y compris dans les répliques de recruteur données en exemple (« Parlez-moi de vous »).
3. **Pas de tiret cadratin** (le caractère long), ni de tiret demi-cadratin. Utiliser la virgule, les deux-points ou une nouvelle phrase.
4. **Ton positif et non évaluatif** : on décrit, on propose, on ne juge pas. « Vous pouvez renforcer… » plutôt que « c'est insuffisant ». Ce qui fonctionne d'abord, les pistes ensuite.
5. **Aucune note, aucun score, aucune promesse de résultat** (« décrochez le poste », « 90 % de réussite »). Aucune référence à des émotions déduites ou à la personnalité (« paraître confiant », « avoir l'air stressé » sont à éviter : parler de gestes et de faits observables).
6. **Repères présentés comme des conventions**, variables selon le poste, le secteur et la culture, jamais comme des vérités universelles.
7. **Conseils concrets** : chaque section donne quelque chose à faire, à dire ou à préparer. Un exemple au moins par article.
8. **Rien d'inventé présenté comme réel** : pas de chiffre, de statistique, d'étude, de témoignage, de nom de personne ou d'organisme fictifs présentés comme vrais. Les prénoms d'exemple (« Nadia », « Sami ») sont permis dans un encadré `[!exemple]`. Les références juridiques doivent être exactes et vérifiables (par exemple les articles du Code du travail), sinon s'abstenir.
9. **Inclusivité** : exemples variés (métiers, âges, parcours, expériences hors emploi comme le bénévolat ou les responsabilités familiales). Écriture inclusive au point médian avec parcimonie (« recontacté·e »).
10. **Honnêteté sur l'outil** : La Répét' est un prototype ; ne pas annoncer de fonctionnalité qui n'existe pas. Fonctionnalités existantes : code d'accès sans compte, consentement retirable, échauffement sans enregistrement, questions selon le métier et questions personnelles, caméra ou voix seule (3 minutes maximum), transcription et analyse dans le navigateur, retour descriptif (durée, débit, pauses, exemples concrets, mots d'appui, structure, vocabulaire, direction du regard), rapport écrit ou relecture vidéo avec repères, assistant de questions, envoi volontaire au coach, notes horodatées et commentaires du coach, rapport, indicateurs agrégés, suppression des données.

Longueur visée : **800 à 1 400 mots** pour un `guide` (5 à 7 minutes de lecture), **600 à 900 mots** pour un `cas`.

## 7. Sujets à écrire (une vingtaine)

| Slug proposé | Catégorie | Type |
|---|---|---|
| `se-renseigner-sur-l-employeur` | preparer | guide |
| `parler-d-un-parcours-non-lineaire` | preparer | guide |
| `valoriser-le-benevolat-et-les-experiences-hors-emploi` | preparer | guide |
| `preparer-sa-tenue-selon-le-secteur` | preparer | guide |
| `apres-l-entretien-remercier-et-relancer` | preparer | guide |
| `repondre-a-quels-sont-vos-defauts` | questions | guide |
| `parler-de-salaire-sans-se-sous-estimer` | questions | guide |
| `les-questions-de-mise-en-situation` | questions | guide |
| `expliquer-une-reconversion` | questions | guide |
| `entretien-telephonique` | visio | guide |
| `entretien-video-differe-enregistre` | visio | guide |
| `regarder-la-camera-sans-se-crisper` | visio | guide |
| `comprendre-son-retour-points-d-appui-et-pistes` | guides | guide |
| `s-entrainer-en-voix-seule` | guides | guide |
| `envoyer-une-prise-a-son-coach` | guides | guide |
| `animer-un-debriefing-a-partir-d-une-prise` | coachs | guide |
| `ecrire-une-note-horodatee-utile` | coachs | guide |
| `scenario-preparation-job-dating` | coachs | cas |
| `rendre-compte-sans-surveiller` | commanditaires | guide |
| `accompagner-une-mobilite-interne` | commanditaires | guide |
| `scenario-preparer-un-entretien-professionnel` | commanditaires | cas |

## 8. Pour publier

1. Créer une branche à partir de `main` : `git checkout -b ressources/<slug>`.
2. Ajouter le fichier `src/content/resources/<slug>.md` et, si elle est prête, l'image `public/img/ressources/<slug>.webp`.
3. Vérifier : `npm install` (la première fois), puis `npm run build` doit réussir. Pour relire le rendu : `npm run dev`, puis ouvrir `http://localhost:5173/#/ressources/<slug>`. Facultatif : `npm run test:site`.
4. Relire la liste de contrôle ci-dessous.
5. Commiter (`git add`, `git commit -m "Ressources : <titre>"`), pousser la branche et ouvrir une pull request vers `main`, avec le titre de l'article et sa catégorie dans la description.

Liste de contrôle avant la pull request :
- [ ] en-tête complet, catégorie et type valides, slug identique au nom du fichier ;
- [ ] aucun tiret cadratin ni demi-cadratin (rechercher les caractères Unicode U+2014 et U+2013) ;
- [ ] vouvoiement partout, y compris dans les exemples de répliques ;
- [ ] aucune note, aucun score, aucune promesse de résultat, aucune émotion déduite ;
- [ ] aucun chiffre, témoignage ou nom réel inventé ; pour un `cas`, organisation fictive et générique, effets au conditionnel ;
- [ ] liens internes vérifiés dans le navigateur.

## Liens autorisés dans les articles

Seuls les liens qui commencent par `https://`, `http://`, `mailto:` ou `#/` (page du site) sont acceptés. Tout autre schéma (`javascript:`, `data:`, etc.) est affiché comme du texte simple et fait échouer `npm run test:design` (règle U1).
