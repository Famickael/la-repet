# Référencement, titres d'onglets et aperçus de lien

Version 1 (21 novembre 2026). Site : https://famickael.github.io/la-repet/ (GitHub Pages, projet servi sous `/la-repet/`, routage par ancre `#/...`).

Fichiers concernés :

| Fichier | Rôle |
|---|---|
| `index.html` (balises du `head`) | Titre, description, `robots`, canonique, Open Graph, carte X, couleurs du navigateur, icônes, manifeste, JSON-LD |
| `src/lib/seo.js` | Titre d'onglet et description de chaque page (actuelles et à venir), `applySeo(route)`. **Non branché** |
| `public/og-image.png` | Image d'aperçu 1200 x 630 (environ 90 Ko) |
| `public/icons/` | `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` |
| `public/site.webmanifest` | Manifeste (nom, couleurs, icônes, `start_url` et `scope` sous `/la-repet/`) |
| `public/robots.txt` | Fermeture actuelle, version d'ouverture et options pour les robots d'IA, en commentaire |
| `public/sitemap.xml` | Plan du site (la racine seule), prêt mais non annoncé |
| `scripts/og-image.html`, `scripts/og-image.mjs` | Source et script de régénération de l'image et des icônes |

## 1. État actuel et décisions

### 1.1 Site fermé à l'indexation

- `index.html` porte `<meta name="robots" content="noindex, nofollow">`. **C'est la seule fermeture réellement active.**
- `public/robots.txt` exclut tous les robots (`User-agent: *` puis `Disallow: /`), sauf les robots d'aperçu de lien. Mais sur GitHub Pages ce fichier est servi à `/la-repet/robots.txt`, alors que les robots ne lisent que `/robots.txt` à la racine de l'hôte ; un `robots.txt` placé dans un sous-dossier est ignoré [S5]. Il ne prendra effet qu'avec un nom de domaine propre. Il est prêt pour ce jour-là.
- Pourquoi `noindex` plutôt que `Disallow` : un robot exclu par `robots.txt` ne lit pas la page, donc ne voit jamais le `noindex`, et une adresse connue par ailleurs peut quand même apparaître dans les résultats [S4]. Le jour où le domaine propre arrive, garder `noindex` tant que le site doit rester fermé et ne pas compter sur `Disallow` seul.
- Les robots d'aperçu restent autorisés dans `robots.txt` : X applique la spécification de Google pour `robots.txt` et n'affiche aucune carte pour une page bloquée [S9] ; un `Disallow` général fait échouer l'aperçu LinkedIn [S10]. Slack ne lit pas `robots.txt` [S8]. `noindex` n'empêche pas les aperçus : ce n'est pas une règle pour ces robots.

### 1.2 Une seule page pour les robots

Le site est une application React : `index.html` est la seule page HTML, le contenu est construit par le JavaScript, et chaque écran est une ancre (`#/ressources`, `#/a-propos`…).

- Les robots d'aperçu (Facebook, LinkedIn, WhatsApp, X, Slack, iMessage, Teams) lisent le HTML reçu, sans exécuter le JavaScript. Aucune de leurs documentations ne mentionne une exécution ; elles décrivent des balises à placer dans le HTML [S6] [S7] [S8] [S11].
- L'ancre n'est jamais envoyée au serveur : `https://famickael.github.io/la-repet/#/ressources/se-presenter-en-deux-minutes` et la racine sont la même requête.
- Google exécute le JavaScript, mais demande de ne pas charger un contenu différent selon l'ancre et de ne pas utiliser d'ancre en canonique [S3] [S13].

**Conséquence : tout lien partagé, quelle que soit la page, affiche l'aperçu d'`index.html`** (titre « S'entraîner aux entretiens avec un coach », image de marque). Seule la racine est indexable : la canonique et le plan du site ne désignent qu'elle (un plan du site ne liste que des adresses absolues, explorées telles quelles [S2]). Voir la section 3 pour des aperçus par page.

### 1.3 Balises d'`index.html`

| Balise | Valeur et raison |
|---|---|
| `title` | « S'entraîner aux entretiens avec un coach · La Répét' » : ce que fait le site d'abord, la marque ensuite. Le titre d'onglet change ensuite à chaque page (`src/app/router.js`, puis `applySeo`) |
| `description` | 153 caractères, même texte que `SEO["#/"]` |
| `canonical` | `https://famickael.github.io/la-repet/`, adresse absolue, sans ancre [S13] |
| `og:type`, `og:site_name`, `og:locale` | `website`, « La Répét' », `fr_FR` (format `langue_TERRITOIRE`) [S1] |
| `og:title` | Sans la marque (déjà dans `og:site_name`), comme le recommandent Facebook et WhatsApp [S6] [S7] |
| `og:description` | Courte (environ 100 caractères) : WhatsApp en affiche une ou deux lignes [S7] |
| `og:url` | Adresse canonique, sans paramètre [S6] [S7] |
| `og:image` et ses propriétés | Adresse absolue [S7], type, largeur et hauteur (affichage dès le premier partage [S6]) et texte de remplacement (`og:image:alt`, demandé par le protocole dès qu'il y a une image [S1]) |
| `twitter:card` | `summary_large_image`. X reprend `og:title`, `og:description` et `og:image` en l'absence de balises `twitter:` ; seul `twitter:image:alt` est ajouté [S9] |
| `theme-color` | `#F8FAFC` clair, `#0E141E` sombre, comme les fonds du site (`src/tokens.js`) |
| Icônes | `favicon.svg` (suit le thème du système), PNG 192, `apple-touch-icon` 180 sur fond blanc (iOS remplit la transparence en noir) |
| Manifeste | `site.webmanifest` : icônes 192 et 512 exigées par Chromium [S14], `start_url`, `scope` et `id` sous `/la-repet/`, `display: browser` (le site n'est pas une application installable) |
| JSON-LD | `WebSite` et `Organization`. L'organisme garde le nom d'exemple de `src/content/organisme.js` (« nom à remplacer ») ; adresse, téléphone, SIRET et courriel sont omis car fictifs (les données structurées doivent être exactes [S15]). Limite : Google ne gère le nom de site qu'au niveau d'un domaine ou sous-domaine, pas d'un sous-dossier comme `/la-repet/` [S16] |
| `robots` | `noindex, nofollow`, avec un commentaire qui renvoie à la section 2 |

Toutes les adresses absolues pointent vers `https://famickael.github.io/la-repet/...` ; les chemins locaux (`./icons/...`, `./site.webmanifest`) sont relatifs, comme le reste d'`index.html` (Vite `base: "./"`).

### 1.4 Image d'aperçu

- 1200 x 630 (rapport 1,91:1), PNG d'environ 90 Ko. Références : LinkedIn demande au moins 1200 x 627 et 1,91:1 [S10] ; WhatsApp demande une adresse absolue, moins de 600 Ko, au moins 300 px de large, un rapport de 4:1 au plus [S7] (des retours d'expérience parlent de 300 Ko : la cible retenue est bien en dessous) ; X recadre parfois la grande carte en 2:1 et Teams peut rogner les côtés [S12] : le texte reste loin des bords.
- Contenu : logo blanc, dégradé de marque `GRAD` (bleu vers violet, `docs/design-system.md`, 1.3), phrase « Entraînez-vous pour votre entretien, avec votre coach. » en Outfit 800 de 66 px, puis « À voix haute, sans avatar. Un retour qui décrit, sans noter. » en Inter 600 de 32 px. Pas de photo, pas de petit texte. Vérifiée lisible réduite à 400 px de large.
- Le dégradé est calculé pixel par pixel dans `scripts/og-image.html` : le dégradé CSS de Chromium est tramé, ce bruit faisait dépasser 400 Ko.
- **Régénérer** : `CHROMIUM_PATH=/opt/pw-browsers/chromium node scripts/og-image.mjs` (refait aussi les icônes depuis `public/favicon.svg`). **Après un changement d'image, changer son adresse** (nouveau nom ou `?v=2` dans `index.html`) : Facebook garde l'image en cache par adresse [S6], et LinkedIn ou Teams font de même.

### 1.5 Titres d'onglets proposés (`src/lib/seo.js`)

Format « Page · La Répét' », le mot utile en premier (un onglet tronqué garde le début). L'accueil a son propre titre. Les titres actuels de `src/app/router.js` (« Solutions », « Ressources », « À propos »…) ne disent pas de quoi parle la page quand plusieurs onglets sont ouverts.

| Route | Titre actuel | Titre proposé |
|---|---|---|
| `#/` | S'entraîner à ses entretiens · La Répét' | S'entraîner aux entretiens avec un coach · La Répét' |
| `#/a-propos` | À propos | Qui sommes-nous · La Répét' |
| `#/a-propos/faq` | À propos | Questions fréquentes · La Répét' |
| `#/a-propos/ia-et-recherche` | L'IA et la recherche | IA et recherche : nos choix · La Répét' |
| `#/solutions` | Solutions | Nos accompagnements · La Répét' |
| `#/solutions/demandeurs-emploi` | Solutions | Demandeurs d'emploi · La Répét' |
| `#/solutions/collaborateurs` | Solutions | Salariés en mobilité · La Répét' |
| `#/solutions/coachs` | Solutions | Coachs et conseillers · La Répét' |
| `#/solutions/commanditaires` | Solutions | Commanditaires · La Répét' |
| `#/ressources` | Ressources | Conseils pour l'entretien · La Répét' |
| `#/ressources/c/...` | Ressources | « Catégorie » · Ressources · La Répét' (`seoCategory`) |
| `#/ressources/SLUG` | Ressources | « Titre de l'article » · La Répét' (`seoArticle`) |
| `#/demo` | Nous contacter | Nous contacter · La Répét' |
| `#/espace` | Mon espace | Accéder à mon espace · La Répét' |
| `#/beneficiaire` | Mon espace | Saisir mon code d'accès · La Répét' |
| `#/s/CODE/...` | Mon espace | Mon entraînement · La Répét' |
| `#/coach/...` | Espace coach | Espace coach · La Répét' |
| `#/vos-donnees` | Vos données, vos choix | Vos données, vos choix · La Répét' |
| `#/vos-donnees/video` | Que devient ma vidéo ? | Que devient ma vidéo · La Répét' |
| `#/vos-donnees/assistant` | Ce que fait l'assistant, et ce qu'il ne fait pas | Ce que fait l'assistant · La Répét' |
| `#/vos-donnees/droits` | Vos droits | Vos droits sur vos données · La Répét' |
| `#/vos-donnees/appareil` | Ce qui est gardé sur cet appareil | Données gardées sur cet appareil · La Répét' |
| `#/vos-donnees/notice` | Information complète sur vos données | Information complète sur vos données · La Répét' |
| `#/vos-donnees/coachs` | Coachs : vos données | Données des coachs · La Répét' |
| `#/conditions` | Règles d'utilisation | Règles d'utilisation · La Répét' |
| `#/mentions-legales` | Mentions légales | Mentions légales · La Répét' |
| `#/accessibilite` | Accessibilité | Accessibilité du site · La Répét' |
| ancre inconnue | Page introuvable | Page introuvable · La Répét' |
| `#/solutions/usage-de-l-ia` (à venir) | | Notre usage de l'IA · La Répét' |
| `#/solutions/recherche` (à venir) | | Ce que dit la recherche · La Répét' |
| `#/solutions/fonctionnalites` (à venir) | | Fonctionnalités · La Répét' |
| `#/cas-d-usage/beneficiaires` (à venir) | | Personnes accompagnées · La Répét' |
| `#/cas-d-usage/coachs` (à venir) | | Coachs et conseillers · La Répét' |
| `#/cas-d-usage/commanditaires` (à venir) | | Commanditaires publics et privés · La Répét' |
| `#/ressources/faq` (à venir) | | Questions fréquentes · La Répét' |

Chaque entrée a une description de 140 à 160 caractères ; `checkSeo()` le vérifie (avec le format du titre et l'absence de tiret cadratin). Aucune ne cite de moteur d'IA, de chiffre ou de promesse.

**Brancher `applySeo`** (autre agent) : dans `src/App.jsx`, à chaque changement de route, appeler `applySeo(route)` à la place de `document.title = titleOf(...)`, en passant `seoArticle(titre, résumé)` pour un article et `seoCategory(nom)` pour une catégorie. Quand les routes changent, mettre à jour `seoKey()` et retirer les entrées disparues. Ce branchement améliore l'onglet, l'historique, les favoris et les lecteurs d'écran (RGAA 8.6), et Google qui exécute le JavaScript ; **il ne change rien aux aperçus de lien** (section 1.2).

## 2. Liste de contrôle pour l'ouverture à l'indexation

À faire dans l'ordre, le jour où le propriétaire décide d'ouvrir.

1. **Nom de domaine** (recommandé avant l'ouverture). Un domaine propre (par exemple celui de l'organisme) donne un `robots.txt` réellement lu, un nom de site dans Google [S16] et une adresse stable pour les partages. Sur GitHub Pages : fichier `public/CNAME`, réglage du domaine dans le dépôt, HTTPS forcé.
2. **Remplacer l'adresse** `https://famickael.github.io/la-repet/` partout : `index.html` (canonique, `og:url`, `og:image`, JSON-LD), `src/lib/seo.js` (`SITE_URL`), `public/sitemap.xml`, `public/robots.txt` (ligne `Sitemap`), `public/site.webmanifest` (`id`, `start_url`, `scope` si le site passe à la racine : `/`).
3. **Organisme réel** : remplacer le nom d'exemple dans le JSON-LD par le nom validé (`src/content/organisme.js`) ; ajouter alors `email`, `telephone`, `address` et `sameAs` s'ils sont réels [S15].
4. **Retirer** `<meta name="robots" content="noindex, nofollow">` d'`index.html`.
5. **`robots.txt`** : remplacer le contenu actif par la version d'ouverture en commentaire (`Allow: /` et la ligne `Sitemap`), avec l'option retenue pour les robots d'IA (2.3).
6. **Search Console** (Google) et **Bing Webmaster Tools** : déclarer le domaine, soumettre `sitemap.xml`, demander l'indexation de la racine avec l'outil d'inspection d'adresse, vérifier les données structurées avec le test des résultats enrichis [S15].
7. **Plan du site** : il ne liste que la racine tant que les pages n'ont pas de vraies adresses. L'enrichir avec la section 3.
8. **Vérifier les aperçus** (section 4) sur l'adresse définitive.

### 2.1 Date d'ouverture

À décider par le propriétaire. Conditions raisonnables : valeurs réelles de l'organisme en place (aucun « exemple » visible), mentions légales et déclaration d'accessibilité finalisées, nom de domaine choisi.

### 2.2 Ce qui ne doit jamais être indexé

Les espaces personnels (`#/s/CODE`, `#/coach`) n'existent que sur l'appareil et ne sont pas des adresses distinctes : rien à exclure aujourd'hui. Avec de vraies adresses, ils resteraient hors du plan du site et porteraient `noindex`.

### 2.3 Robots d'IA : décision du propriétaire

Ces règles de `robots.txt` ne changent rien au référencement dans Google ou Bing : `Google-Extended` est un simple jeton de contrôle sans effet sur la recherche Google [S17], `Applebot-Extended` ne retire rien de la recherche Apple [S21].

| Robot | Ce qu'il fait | Source |
|---|---|---|
| `GPTBot` | Entraînement des modèles d'OpenAI | [S18] |
| `OAI-SearchBot` | Présence dans les réponses de recherche de ChatGPT | [S18] |
| `ChatGPT-User` | Visite à la demande d'une personne ; `robots.txt` « peut ne pas s'appliquer » | [S18] |
| `ClaudeBot` | Entraînement des modèles d'Anthropic | [S19] |
| `Claude-SearchBot`, `Claude-User` | Recherche, visite à la demande d'une personne | [S19] |
| `Google-Extended` | Entraînement et ancrage des modèles Gemini | [S17] |
| `Applebot-Extended` | Entraînement des modèles d'Apple | [S21] |
| `CCBot` | Archive ouverte Common Crawl, souvent reprise pour entraîner des modèles | [S20] |
| `PerplexityBot` | Présence dans les résultats de Perplexity (pas d'entraînement) ; `Perplexity-User` ignore en général `robots.txt` | [S22] |

Trois options sont prêtes en commentaire dans `public/robots.txt` : A, tout accepter ; B, refuser l'entraînement mais rester cité dans les moteurs de réponse ; C, tout refuser. Les contenus publics concernés sont les articles de Ressources et les pages de présentation ; les données des personnes ne sont jamais en ligne. Aucune option n'est recommandée ici : c'est un choix éditorial de l'organisme.

## 3. Aperçus et référencement par page (à faire plus tard)

Aujourd'hui, un article de Ressources partagé sur LinkedIn montre l'aperçu de l'accueil. Pour un aperçu propre à chaque page, il faut que chaque page existe en HTML, à sa propre adresse, avant tout JavaScript. Trois étapes, de la plus simple à la plus complète.

### 3.1 Pages statiques de partage générées au build (petit pas, sans toucher au routage)

Un petit greffon Vite (`generateBundle`) écrit, pour chaque article de `src/content/resources/` et chaque page publique, un fichier `dist/r/<slug>/index.html` qui contient seulement le `head` de la page (titre, description, `og:*` de la page, `og:url` vers cette adresse, canonique) et renvoie la personne vers l'ancre : `<meta http-equiv="refresh" content="0; url=../../#/ressources/<slug>">` et un lien visible. On partage alors `https://.../la-repet/r/<slug>/` : les robots lisent les bonnes balises, les personnes arrivent sur l'article. Limites : deux adresses par page (canonique à choisir), et Google n'aime pas les redirections par `refresh` pour l'indexation. Bon pour les aperçus, moyen pour le référencement.

### 3.2 Vraies routes (History API) et pré-rendu

- Passer de `#/ressources/slug` à `/la-repet/ressources/slug` (History API, recommandée par Google [S3]) : réécrire `src/app/router.js`, les liens, `src/lib/viewHash.js` et les tests. Garder la reprise des anciennes ancres (redirection de `#/...` vers la nouvelle adresse) pour ne casser aucun lien déjà partagé.
- GitHub Pages ne sait pas servir `index.html` pour une adresse inconnue : il faut donc **un fichier HTML par page publique** (pré-rendu), et une page `404.html` qui rattrape les espaces personnels.
- Pré-rendu au build : rendre chaque route publique avec `react-dom/server` (`renderToString`) ou en ouvrant le site construit dans Playwright (déjà installé) et en enregistrant le HTML ; y injecter les balises de `src/lib/seo.js`. Outils possibles : `vite-plugin-ssr`/Vike, `vite-react-ssg`, ou un script maison d'une centaine de lignes. À vérifier : écran de chargement, thème, contenus qui dépendent du stockage local (ils ne doivent pas être pré-rendus).
- Alors seulement : `HASH_ROUTING = false` dans `src/lib/seo.js` (canonique par page), une entrée par page publique dans `sitemap.xml`, une image d'aperçu par grande rubrique si souhaité.

### 3.3 Image d'aperçu par article (facultatif)

`scripts/og-image.mjs` peut être étendu pour produire `og/<slug>.png` avec le titre de chaque article, au même gabarit. Utile seulement avec 3.1 ou 3.2.

## 4. Tester les aperçus

Les robots ne lisent que le site en ligne : tester après le déploiement, sur l'adresse publique.

| Outil | Usage |
|---|---|
| Débogueur de partage Facebook, https://developers.facebook.com/tools/debug/ | Balises lues, avertissements, et nouvelle lecture forcée (vide le cache de l'aperçu) [S6] |
| LinkedIn Post Inspector, https://www.linkedin.com/post-inspector/ | Aperçu LinkedIn et nouvelle lecture de la page |
| opengraph.xyz, https://www.opengraph.xyz/ | Aperçus simulés de plusieurs réseaux en une fois |
| Test des résultats enrichis, https://search.google.com/test/rich-results | Validation du JSON-LD [S15] |
| Validateur schema.org, https://validator.schema.org/ | Validation générale des données structurées |
| Slack, WhatsApp, iMessage, Teams | Coller le lien dans une conversation de test. Slack garde l'aperçu environ 30 minutes [S8] ; Teams et WhatsApp gardent longtemps l'ancienne image (changer l'adresse de l'image) |

Le validateur de cartes de X n'existe plus : tester en rédigeant un message sans le publier.

Vérification locale avant déploiement : `npm run build`, puis contrôler dans `dist/index.html` les balises, les adresses absolues et la présence de `og-image.png`, `icons/`, `site.webmanifest`, `robots.txt` et `sitemap.xml` dans `dist/`.

## 5. Sources consultées (21 novembre 2026)

- [S1] The Open Graph protocol, https://ogp.me/ : propriétés requises, `og:image:*`, `og:image:alt`, format de `og:locale`.
- [S3] Google, Notions de base sur le SEO JavaScript, https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics : « don't use fragments to load different page content », History API.
- [S4] Google, Balise meta robots, https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag : syntaxe, et un robot bloqué par `robots.txt` ne voit pas `noindex`.
- [S5] Google, Créer un fichier robots.txt, https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt : fichier à la racine de l'hôte, ignoré dans un sous-dossier ; format de `Sitemap:`.
- [S6] Meta, Partage pour les webmasters, https://developers.facebook.com/docs/sharing/webmasters/ : balises recommandées, largeur et hauteur, cache par adresse d'image, débogueur de partage ; robot `facebookexternalhit`, https://developers.facebook.com/docs/sharing/webmasters/web-crawlers.
- [S7] Meta, Aperçus de lien WhatsApp, https://developers.facebook.com/documentation/business-messaging/whatsapp/link-previews/ : `og:title`, `og:description`, `og:url`, image absolue de moins de 600 Ko, 300 px de large au moins, rapport de 4:1 au plus, `head` dans les 300 premiers Ko.
- [S8] Slack, Slackbot, https://api.slack.com/robots : lit oEmbed, cartes X et Open Graph, ne suit pas `robots.txt`, cache d'environ 30 minutes.
- [S9] X, Cards markup, https://developer.x.com/cards/markup (lue par moteur de recherche, la page refuse la lecture automatique) : `summary_large_image`, reprise des balises Open Graph, `twitter:image:alt`, Twitterbot suit `robots.txt`.
- [S10] LinkedIn, Aperçu des liens partagés, https://www.linkedin.com/help/linkedin/answer/a521928 : `og:title`, `og:image`, `og:description`, `og:url`, image de 1200 x 627 au moins, 1,91:1, 5 Mo au plus ; blocage par `robots.txt` : retours d'expérience (par exemple https://news.lavx.hu/article/how-blocking-web-crawlers-broke-my-linkedin-previews-a-robots-txt-cautionary-tale).
- [S11] Apple, TN3156 Create rich previews for Messages, https://developer.apple.com/documentation/technotes/tn3156-create-rich-previews-for-messages : page consultée mais non lisible sans JavaScript ; iMessage lit les balises Open Graph et les icônes du HTML (règle générale, à revérifier).
- [S12] Microsoft, aperçus de lien dans Teams : https://learn.microsoft.com/en-us/answers/questions/5636536/how-do-i-update-the-thumbnail-in-a-url-preview-on (Open Graph ou schema.org, cache tenace) et https://learn.microsoft.com/en-us/answers/questions/1867084/open-graph-thumbnail-previews-for-urls-get-cut-off (image 1200 x 630 rognée sur les côtés).
- [S13] Google, Adresses canoniques, https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls : adresse absolue, dans le `head`, pas d'ancre.
- [S14] web.dev, Ajouter un manifeste, https://web.dev/articles/add-manifest : `name`, `short_name`, icônes 192 et 512, `start_url`, `scope`, `theme_color`.
- [S15] Google, Données structurées Organization, https://developers.google.com/search/docs/appearance/structured-data/organization : propriétés, page d'accueil, exactitude, test des résultats enrichis.
- [S16] Google, Noms de sites, https://developers.google.com/search/docs/appearance/site-names : `WebSite` sur la page d'accueil, pas de nom de site au niveau d'un sous-dossier.
- [S17] Google, Robots courants, https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers : `Google-Extended` sans effet sur la recherche.
- [S18] OpenAI, Robots d'OpenAI, https://developers.openai.com/api/docs/bots : `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`.
- [S19] Anthropic, robots.txt, https://support.claude.com/en/articles/8896518-robots-txt-controls : `ClaudeBot`, `Claude-User`, `Claude-SearchBot`.
- [S20] Common Crawl, CCBot, https://commoncrawl.org/ccbot : agent et exclusion par `robots.txt`.
- [S21] Apple, Applebot, https://support.apple.com/en-us/119829 : `Applebot-Extended`, sans effet sur la recherche.
- [S22] Perplexity, Robots, https://docs.perplexity.ai/guides/bots : `PerplexityBot`, `Perplexity-User`.
- [S2] Google, Créer un sitemap, https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap : adresses absolues, portée limitée au dossier, `lastmod` exact seulement, `priority` et `changefreq` ignorés.
