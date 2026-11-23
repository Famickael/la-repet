# Rédaction de La Répét' : charte éditoriale et réécritures

Relecture faite le 20 novembre 2026 sur l'arbre de travail (fichiers de `src/` en cours d'harmonisation par ailleurs). Les textes actuels sont copiés du code. Les éléments sont désignés par composant ou constante plutôt que par numéro de ligne, car les fichiers bougent.

Sommaire :

1. Charte éditoriale courte (1.2 quater : décisions de la passe de cohérence du 22 novembre 2026)
2. Tableau des réécritures, écran par écran
3. Répétitions repérées et arbitrages
4. Points à trancher par le propriétaire (textes de démonstration, affirmations à vérifier)

---

## 1. Charte éditoriale courte

### 1.1 Plateforme de marque

**Promesse.** Se préparer à l'entretien en confiance : seul, à voix haute, sans avatar et sans jugement, avec des retours pour recommencer et son coach qui soutient la progression.

**Preuve en une phrase.** L'assistant analyse l'entretien sans le noter et propose des pistes, la personne recommence et choisit ce qu'elle envoie, le coach a le dernier mot.

**Ton.** Celui d'un coach bienveillant et précis : il parle simplement, il dit ce qui se passe, il ne juge pas et ne promet rien qu'il ne tient pas. On s'adresse à la personne qui s'entraîne avec « vous », au présent, avec des mots de tous les jours. On s'adresse aux coachs et aux organismes avec la même simplicité, sans jargon commercial.

**Trois mots-clés.**

| Mot-clé | Ce que cela veut dire dans un texte |
|---|---|
| Simple | Une idée par phrase. Des mots concrets. Pas de terme technique sans explication. |
| Factuel | On décrit ce qui se voit et s'entend. Pas de note, pas d'adjectif qui évalue, pas d'émotion devinée. Pas de chiffre ni de promesse invérifiable. |
| Libre | La personne décide : recommencer, envoyer, supprimer. Les textes disent toujours « vous pouvez », jamais « vous devez ». |

### 1.2 Lexique imposé

Un mot par chose, partout. Quand un mot du lexique apparaît pour la première fois sur un écran destiné à la personne qui s'entraîne, la phrase l'explique.

| Terme retenu | À éviter | Définition et usage |
|---|---|---|
| **entretien** | réponse, prise, enregistrement (pour ce que l'on enregistre, garde, envoie, relit ou supprime) | Deux sens. Le vrai rendez-vous avec un recruteur ; et, depuis la décision du propriétaire du 22 novembre 2026, ce que la personne enregistre dans l'outil, garde, envoie à son coach, relit ou supprime, côté personne accompagnée comme côté coach : « Mes entretiens », « Garder cet entretien », « Envoyer cet entretien à mon coach », « Supprimer cet entretien », « Annuler l'envoi de cet entretien », « Entretiens à relire ». Les accords suivent le masculin (« Envoyé le », « Gardé sur cet appareil », « supprimé »). |
| **entraînement**, **s'entraîner** | répétition, répéter, répétez (pour l'activité), session, séance | L'activité : choisir une ou plusieurs questions et y répondre, seul et à voix haute. Depuis le 22 novembre 2026, « répéter » n'est plus employé pour l'activité, même dans les titres : seul le nom de marque « La Répét' » le porte. « Répéter » reste au sens propre : « répéter une question », « petits mots répétés », « une répétition générale ». |
| **sans avatar** | sans recruteur virtuel, sans robot, sans personnage | Il n'y a pas d'interlocuteur animé à l'écran. La question est lue à voix haute, sans visage. Ne jamais écrire que l'avatar est « moins efficace » : aucune étude citée ne le dit (voir 1.2 ter). |
| **piste**, **conseil** | amélioration, correction, défaut, verdict | Ce que l'assistant propose après un repère « à explorer », toujours avec « vous pouvez ». « Conseil » est le mot de l'interface du retour ; « piste » celui des pages publiques. |
| **comparer**, **ce qui a changé**, **mesurer votre progression** | score, niveau, courbe, jauge, pourcentage de progression, « mieux », « moins bien », « vous vous êtes amélioré » | Depuis le 23 novembre 2026, la promesse du site est « Comparez vos différents entraînements pour mesurer votre progression » (choix du propriétaire, « mesurer » compris). L'écran « Comparer mes entraînements » met deux entretiens côte à côte. Ce qui est mesuré, ce sont des indicateurs factuels (durée, rythme de parole, pauses, petits mots répétés, exemples), jamais une note : on le dit là où c'est utile. La synthèse « Ce qui a changé » décrit un écart (« vous avez ajouté un exemple », « plus court », « 3 au lieu de 10 ») et ne le qualifie jamais. La personne conclut avec son coach. |
| **réponse** | (pour ce que l'on enregistre, garde, envoie ou supprime : écrire « entretien ») | Seulement au sens propre : ce que la personne dit pour répondre à une question. « Préparez votre réponse », « la réponse à cette question », « pendant votre réponse », « 3 minutes au plus par réponse », « la structure de la réponse ». Jamais dans un libellé d'action (`npm run test:content` le vérifie). |
| **échauffement** | mise en voix, se mettre en voix | Quelques minutes pour dire des phrases à voix haute avant l'entraînement. Rien n'est enregistré. |
| **consigne** (d'échauffement) | relance | La petite instruction qui propose une autre façon de dire la phrase. |
| **retour** | rapport écrit (pour l'assistant), débrief, feedback | Ce que l'assistant produit sur un entretien. Toujours « le retour de l'assistant ». Le verbe est « analyser » (« l'assistant analyse votre entretien, sans le noter ») ; le nom du résultat reste « retour ». |
| **rapport** | retour (pour le coach) | Ce que le coach renvoie : son message, ses remarques, ses commentaires sur les repères. Toujours « le rapport de votre coach ». |
| **repère** | observation (nom), marqueur, dimension, indicateur | Une chose que l'assistant a remarquée, placée à un moment de la réponse. Première occurrence : « un repère, c'est ce que l'assistant a remarqué ». Le verbe « observer » reste autorisé. |
| **point d'appui** | point fort, réussite, « Appui » seul sans contexte | Un repère sur ce qui fonctionne déjà. Toujours présenté en premier. |
| **à explorer** | à améliorer, point faible, insuffisant, erreur | Un repère sur une piste que la personne peut travailler si elle le veut. |
| **petits mots répétés** | mots d'appui, tics de langage, mots parasites | Les « euh », « ben », « du coup ». « Mots d'appui » est banni : il se confond avec « point d'appui », qui dit l'inverse. |
| **rythme de parole** | débit | Le nombre de mots par minute. C'est déjà le terme du retour ; les pages publiques s'alignent. |
| **remarque** (du coach) | note, note horodatée, annotation | Ce que le coach écrit à un moment précis de la vidéo. « Note » est réservé à « sans note », pour qu'aucune personne ne croie qu'elle est notée. |
| **débriefing** | débrief | L'échange entre la personne et son coach, à partir du rapport. Côté personne accompagnée, préférer « en parler avec votre coach ». |
| **parcours** | dossier, fiche, compte | Ce que le coach crée pour une personne. Mot réservé à l'espace coach et aux pages pour professionnels. Côté personne accompagnée, on dit « votre espace ». |
| **code d'accès** | code d'entraînement, code personnel, code d'essai, code seul à la première mention | Les 6 caractères donnés par le coach. Première mention : « code d'accès (6 caractères) ». Ensuite « votre code » suffit. |
| **mon espace / votre espace** | espace bénéficiaire, espace personnel, espace d'entraînement | L'endroit où la personne s'entraîne et retrouve ses réponses. « Mon espace » sur les boutons, « votre espace » dans les phrases. |
| **espace coach** | espace conseiller, back-office | L'endroit où le coach crée les parcours et relit les réponses reçues. |
| **personne accompagnée** | bénéficiaire, usager, candidat, apprenant | Le terme générique pour parler d'elle aux coachs et aux commanditaires. Jamais affiché à la personne elle-même. Quand le public compte, on précise : **demandeur d'emploi** ou **collaborateur** (d'entreprise). |
| **commanditaire** | client, acheteur, licencié, organisme (pour celui qui confie l'accompagnement) | L'acteur public de l'emploi (France Travail, collectivité, structure d'insertion, cité comme exemple, jamais comme partenaire) ou l'entreprise qui confie un accompagnement à notre organisme. |
| **notre organisme** | l'éditeur, la plateforme, la solution | L'organisme d'accompagnement à qui appartient La Répét'. Il vend son accompagnement, pas un logiciel. |
| **collaborateurs en mobilité** | salariés (dans un titre), ressources | Le public des entreprises : mobilité interne ou externe, entretien annuel ou professionnel côté salarié, reconversion. |
| **coach** | conseiller, accompagnant, « coach IA » | Toujours un humain. L'outil n'est jamais un « coach ». |
| **assistant** | IA, coach IA, robot, algorithme | Le programme qui analyse l'entretien, sans le noter, et répond aux questions. « Assistant IA » une fois par page pour la transparence, « l'assistant » ensuite. |
| **envoyer** | partager, transmettre, soumettre | L'action volontaire de la personne vers son coach. Un seul destinataire, donc « envoyer ». |
| **accord** | consentement (hors textes légaux) | Ce que la personne donne avant de commencer et peut retirer. « Consentement » reste dans les textes légaux et côté coach ou DPO. |
| **voix seule** | son seulement, son seul, micro seul, audio | Répondre sans caméra. |
| **relire** (coach uniquement) | visionner, reviewer | Ce que fait le coach avec une réponse reçue. Côté personne accompagnée : « revoir » (sa vidéo), « lire » (son retour). |
| **deviner** (les émotions) | déduire, inférer (hors pages juridiques) | « L'assistant ne cherche pas à deviner vos émotions. » « Inférence » et « reconnaissance des émotions » restent sur les pages juridiques. |
| **outil** | dispositif, solution, plateforme, module | Le mot courant pour désigner La Répét'. « Dispositif » est du vocabulaire d'insertion. |
| **ressource** | article (dans l'interface) | Tout contenu du centre de ressources : guide ou scénario d'usage. |
| **nous contacter** (bouton), **projet d'accompagnement** (phrase) | Demander une démo, demander une prise en main, devis, essai gratuit | « Nous contacter » dans l'en-tête et le pied de page ; « Parler de votre projet » dans les pages ; titre de la page : « Parler de votre projet d'accompagnement ». |

### 1.2 bis Positionnement (décision du propriétaire, 21 novembre 2026)

- **La Répét' appartient à un organisme d'accompagnement.** Ce n'est pas un logiciel vendu en tant que tel : aucun discours d'éditeur ou de « SaaS », pas de « équipez votre structure », pas de tarif, pas de licence, pas de marque blanche.
- **L'organisme vend sa compétence d'accompagnement**, outillée par La Répét', à des **commanditaires** :
  - publics : accompagnement des demandeurs d'emploi, retour à l'emploi, insertion (France Travail, collectivités, départements, structures d'insertion, toujours comme exemples et sans affirmer de partenariat) ;
  - privés : entreprises qui font accompagner leurs collaborateurs (mobilité interne ou externe, entretien de mobilité, entretien annuel ou professionnel côté salarié, reconversion).
- **Les coachs sont les accompagnateurs de l'organisme** (« nos coachs »). Les personnes accompagnées sont des demandeurs d'emploi ou des collaborateurs d'entreprise.
- **Confidentialité vis-à-vis du commanditaire** : il reçoit un bilan d'ensemble, jamais une réponse, un retour, un rapport ni une mesure individuelle.
- **Voix** : sur les pages publiques, « nous » désigne l'organisme ; on écrit « notre organisme », « nos coachs ».
- **Moteur d'IA** : jamais nommé dans le site ni dans les textes (ni nom de fournisseur, ni nom de modèle). On écrit « assistant IA » une fois par page, puis « l'assistant ». Contrôlé par `npm run test:content`.
- **Carte du site (21 novembre 2026)** : « À propos » décrit l'organisme (aujourd'hui un organisme imaginaire, « Capes & Carrières », qui accompagne des super-héros : texte d'exemple signalé par un encart, à remplacer ; l'humour reste sur cette seule page). « Solutions » : ce qui nourrit la solution (« Usage de l'IA », « Recherche en accompagnement », « Fonctionnalités »). « Cas d'usage » : une page par public (« Personnes accompagnées » avec « Demandeurs d'emploi » et « Collaborateurs en mobilité », « Coachs », « Commanditaires » avec les onglets « Acteurs publics », « Entreprises », « Cadre et données »). « Ressources » : une seule page (recherche, « À la une », toutes les ressources filtrables par thème) ; « Questions fréquentes » sur sa propre page.
- **« Demander de l'aide »** : quand une session est ouverte, « Nous contacter » devient « Demander de l'aide » et mène aux questions fréquentes, sur la section de la personne connectée (personnes accompagnées ou coachs). Choix retenu plutôt que l'assistant de l'espace : l'assistant répond aux questions sur l'entretien, pas sur le site, et il n'existe pas sur toutes les pages.
- **Accueil (panel bénéficiaires, textes remplacés le 22 novembre 2026, voir 1.2 ter)** : pastilles « Avec votre coach », « Assistant IA », « Sans note » ; sous-titre : « Vous répondez à des questions d'entretien, à voix haute, autant de fois que vous voulez. Un assistant IA décrit votre réponse, sans la noter : rythme, pauses, exemples concrets. Votre vidéo reste sur votre appareil : vous choisissez ce que voit votre coach. » ; sous le bouton : « Pas de compte à créer : il vous faut le code donné par votre coach. » ; bandeau de réassurance en trois puces. « Sans frais pour vous » et la question « Est-ce payant pour moi ? » sont publiées (voir 1.2 quater), à confirmer par le propriétaire.
- **Conservé** : code d'essai `REPETE` prérempli, identifiants coach préremplis, « Entretien du 12 mars », aucun texte qui révèle un test. Le bouton « Lancer ma première répétition » devient « Je lance mon premier entraînement » (1.2 ter).

### 1.2 ter Précision du positionnement : s'entraîner seul, sans avatar, et recommencer (22 novembre 2026)

Cette section ne remplace pas le positionnement de 1.2 bis : elle le précise. Tout ce qui précède reste vrai : un outil d'entraînement porté par un organisme d'accompagnement, un assistant qui décrit sans noter, une vidéo qui reste sur l'appareil, une personne qui choisit ce qu'elle envoie, un coach qui relit et débriefe.

**La précision, en cinq lignes.**

1. **Pas besoin d'avatar pour s'entraîner.** La personne s'entraîne seule, à voix haute. La question est lue à voix haute, sans visage qui observe. C'est plus simple : un téléphone suffit, rien à apprivoiser.
2. **Un retour, puis des pistes.** L'assistant analyse l'entretien sans le noter (rythme de parole, pauses, exemples concrets), en commençant par les points d'appui. Il propose ensuite des pistes, toujours avec « vous pouvez ».
3. **Recommencer.** La personne refait la même question autant de fois qu'elle veut, avec une piste en tête. C'est la boucle de la page Méthode : s'entraîner, se revoir, lire le retour, en parler, transférer.
4. **Comparer ses entraînements pour mesurer sa progression.** Elle met deux entretiens côte à côte (depuis une analyse ou depuis « Mes entretiens ») et lit ce qui a changé : un exemple ajouté, une conclusion, des pauses en moins ou en plus, un autre rythme. Des faits mesurés, jamais de note, de score, de pourcentage, de jauge ni de courbe.
5. **Le coach soutient la progression.** Il relit ce qu'elle choisit d'envoyer, confirme ou nuance les repères, et fait le point avec elle. La relation humaine est avec lui, pas avec un personnage à l'écran.

**Ce que l'on peut affirmer, et ce que l'on n'affirme pas.**

- On peut écrire : « sans avatar », « plus simple », « vous n'avez pas besoin d'avatar pour vous entraîner », « ce qui compte : dire sa réponse à voix haute, lire un retour précis, recommencer ».
- On n'écrit pas que l'entraînement sans avatar est « plus efficace » qu'avec un avatar, ni qu'« une voix seule intimide moins » : aucune source ne le montre (la phrase a été retirée de la page Recherche et de la FAQ le 22 novembre 2026). Les essais VR-JIT et MACH donnent des résultats encourageants avec un recruteur virtuel ; aucune étude ne compare un avatar et une voix seule dans un outil comme le nôtre.
- On n'écrit pas non plus : que l'avatar n'aide pas (un personnage bien animé aide à apprendre, selon Mayer) ; qu'une voix de synthèse vaut une voix humaine ; que la « vallée de l'étrange » vaut pour tous les avatars (on écrit « peut ») ; que la plupart des entretiens se font par téléphone ; que le règlement européen sur l'IA interdit les avatars. Aucun chiffre sur le poids d'un avatar, les entretiens vidéo différés ou les heures de pratique. On ne nomme et ne critique aucun autre outil.
- Le choix se présente toujours comme **un choix de conception assumé, pas un résultat prouvé**. La section « Une voix, pas d'avatar : un choix assumé » de la page Recherche donne huit raisons, chacune avec sa limite et ses sources (rapport de recherche du 22 novembre 2026) : attention sur la réponse, voix pour poser la question, retour précis puis nouvel essai, se revoir, pas de visage presque humain, proximité avec la présélection au téléphone, outil léger, IA qui dit ce qu'elle est. Les pages Méthode et Usage de l'IA y renvoient par un encart court. La page Recherche reste sans chiffre.
- L'appui positif vient des travaux sur l'apprentissage déjà cités (pratique délibérée, retour qui porte sur la tâche, réflexion sur l'action) : ils décrivent la boucle essai, retour, nouvel essai, sans la lier à un avatar.
- L'écran de comparaison existe depuis le 23 novembre 2026 (« Comparer mes entraînements », `src/Compare.jsx`). On peut écrire « comparez vos entraînements », « mesurer votre progression », « des faits côte à côte », « ce qui a changé ». On n'écrit jamais que l'outil note, classe ou juge la progression, ni « vous avez progressé de… », ni un pourcentage, ni « mieux » ou « moins bien ». Le coach compare seulement les entretiens que la personne lui a envoyés.
- « Progression » et « progresser » sont permis pour parler du chemin de la personne avec son coach (« votre coach vous soutient »). Ils ne sont jamais suivis d'un chiffre, d'un niveau ou d'un adjectif qui évalue.

**Vocabulaire.** « Entraînement » et « s'entraîner » partout ; « répéter » seulement au sens propre (voir le lexique, 1.2). Le nom de marque « La Répét' » ne change pas.

**Accueil (remplace la ligne « Accueil » de 1.2 bis).**

- Pastilles : « Avec votre coach », « Assisté par IA » (icône étincelle, violet de l'assistant), « Sans avatar ».
- Titre : « Entraînez-vous pour votre entretien, » puis une fin qui change avec la scène : « à votre rythme. », « à voix haute. », « avec vos mots. », « en confiance. ».
- Sous-titre : « À voix haute, sans avatar, entraînez-vous autant de fois que vous voulez ! Un assistant IA analyse votre entretien, sans le noter, et vous propose des pistes : rythme, pauses, exemples concrets. Comparez vos différents entraînements pour mesurer votre progression, avec le soutien de votre coach à chaque étape. »
  - « analyse » (décision du propriétaire du 22 novembre 2026, qui remplace « décrit ») : toujours accompagné de « sans le noter », « sans note » ou « sans jugement », jamais d'un mot qui évalue, d'un score ou d'une lecture des émotions ;
  - « des pistes » plutôt que « des améliorations » : une amélioration suppose un défaut constaté, une piste se prend ou se laisse ;
  - le point d'exclamation est le seul de la page ;
  - « Votre vidéo reste sur votre appareil » quitte le sous-titre : l'engagement est dans le bandeau de réassurance, juste dessous (« Sécurisé »).
- Bouton principal : « Je lance mon premier entraînement » (accueil et page « Personnes accompagnées »).
- Sous la grande phrase : « Entraînez-vous, lisez votre retour, recommencez. Comparez vos entraînements pour mesurer votre progression, et votre coach vous soutient. »

**Où la précision apparaît.** Accueil (héros, grande phrase, étapes), « Personnes accompagnées », « Usage de l'IA », « Méthode » (temps 1, 3 et 4), « Recherche en accompagnement » (« Présence sociale ou pression ? »), questions fréquentes (« Pourquoi n'y a-t-il pas d'avatar ? », « Comment voir ce qui a changé d'un entraînement à l'autre ? », « Pourquoi un entraînement sans avatar ? » côté coachs), titres et descriptions (`src/lib/seo.js`, `index.html`), image d'aperçu de lien. La page « À propos » ne change que de vocabulaire (étape « Simulation et entraînement »).

Les lignes des tableaux de la section 2 qui parlent d'« organismes », de déploiement, d'onglet DSI ou de « Demander une démo » datent d'avant cette décision : elles sont remplacées par les textes actuels du code.

> **Décision du propriétaire (21 novembre 2026).** Côté coach, on dit « entretiens » pour les réponses reçues (« Entretiens à relire », « Entretiens reçus ») ; « Entretien du 12 mars » (accueil) est conservé ; « Lancer ma première répétition » l'a été jusqu'au 22 novembre 2026 (voir 1.2 ter). Le constat RED-01 de `docs/audit-complet.md` n'est donc pas appliqué.

### 1.2 quater Passe de cohérence : décisions de lexique (22 novembre 2026)

Relecture de tous les textes visibles (pages publiques, espaces, assistants, retours, pages « Vos données », titres d'onglets, articles, README). Ces décisions complètent le lexique de 1.2 ; elles ne changent ni le sens ni le positionnement.

**Décisions du propriétaire du 22 novembre 2026 (elles priment sur tout ce qui suit et sur les tableaux de la partie 2, antérieurs).** (1) Ce que l'on enregistre, garde, envoie, relit, supprime ou dont on annule l'envoi s'appelle « entretien », partout : personne accompagnée, coach, pages publiques, questions fréquentes, « Vos données », pages légales, assistants, titres d'onglets, articles, libellés ARIA. « Réponse » reste au sens propre (la réponse à une question). (2) L'assistant « analyse » l'entretien, toujours « sans le noter », « sans note » ou « sans jugement » ; il n'est plus écrit qu'il le « décrit ». Méthode et Recherche gardent l'argument : « l'assistant analyse et décrit ce qu'il observe, sans noter ». (3) Aucun texte visible ne mentionne une version d'essai (voir plus bas).

| Terme retenu | À éviter | Décision et usage |
|---|---|---|
| **mise par écrit**, **mettre par écrit**, **le texte de l'entretien** | transcription, transcrire, transcrit (côté personne accompagnée et pages publiques) | Ce que l'outil fait de la voix. « Transcription » reste dans les pages juridiques (« service de transcription »), la documentation technique et les messages techniques sous « Détail pour le support ». |
| **outil de mise par écrit** | outil d'écriture, outil d'analyse, modèle de transcription | Ce que l'appareil télécharge la première fois. Première mention : « votre appareil télécharge un outil (environ 130 Mo) ». C'est toujours « votre appareil » qui télécharge, jamais « l'assistant ». Dans le tableau « Sur cet appareil » : « Les outils téléchargés la première fois ». |
| **130 Mo** | 80 Mo, 85 Mo (dans une phrase adressée à la personne) | Le poids annoncé du premier téléchargement, partout : questions fréquentes, accord, écran de préparation, « Usage de l'IA », assistant. Le tableau des services tiers de « Vos données » détaille les fichiers (environ 80 Mo et 4 Mo) : c'est un détail, pas une autre promesse. |
| **3 minutes au plus par réponse** | trois minutes maximum, jusqu'à 3 minutes, au maximum trois minutes | La durée maximale d'une réponse, avec les mêmes mots sur l'accueil, les pages publiques, le choix des questions, l'assistant, les questions fréquentes et les articles. |
| **voix seule** (rappel) | micro seul, son seulement, audio | Y compris dans les réponses de l'assistant et les articles. Le bouton s'appelle « Voix seule ». Pour le matériel, on écrit « seulement un micro ». |
| **repère** (rappel) | observation (nom) | Appliqué aux réponses de l'assistant, à l'assistant de rédaction du coach (« Repère de l'assistant », « Sur le repère ») et aux articles. « Observer », « auto-observation » et « l'observation de pairs » (Bandura) restent. |
| **remarque** (rappel), **remarque placée dans la vidéo** | note, note horodatée, annoter | Y compris dans l'assistant de rédaction (« Remarque à 0:12 », « en remarque à 0:12 de la vidéo »). « Remarque horodatée » est toléré dans le titre du guide pour les coachs. « Vos notes » (celles que l'on prend pour soi) reste. |
| **lire mon retour**, **me revoir en vidéo**, **me réécouter** | rapport écrit, relecture vidéo, mode vidéo | Les trois façons de découvrir le retour portent le nom de leur bouton, partout (accueil, assistant, articles). « Rapport » reste réservé au coach. |
| **rythme de parole** (rappel) | débit, vitesse de parole, vitesse de la voix | Y compris dans l'accord, « Vos données », les propositions de l'assistant du coach et les articles. |
| **garder** (un entretien), **recommencer** | valider, refaire (pour le bouton) | Les boutons s'appellent « Garder cet entretien », « Voir mon retour », « Recommencer ». |
| **envoyer** (rappel), **annuler l'envoi** | partager, transmettre, reprendre son envoi, mettre à disposition | Pour l'entretien envoyé au coach et pour le rapport envoyé à la personne. Côté coach : « La personne a annulé l'envoi ». « Transmettre » reste pour le code que le coach transmet. |
| **donner** (le code, côté personne) | remettre, transmettre (dans une phrase adressée à la personne) | « Le code d'accès que votre coach vous a donné. » Côté coach et pages pour professionnels : « transmettre le code ». |
| **entretien** (ce qui est gardé, envoyé, supprimé) | réponses, entraînements (au pluriel, pour des éléments) | « Vos entretiens restent sur cet appareil », « Supprimez vos entretiens avant de partir ». « Entraînement » désigne l'activité. Décision du 22 novembre 2026, qui remplace « réponse ». |
| **entretien** (partout, rappel) | réponse (pour un élément gardé, envoyé ou reçu) | Décision du propriétaire du 22 novembre 2026, qui étend celle du 21 novembre à tout le site : « Mes entretiens », « Entretiens à relire », « Envoyé le », « Cet entretien n'existe plus », « La personne a annulé l'envoi de cet entretien ». Les pages publiques, les questions fréquentes, « Vos données » et les articles disent aussi « entretien ». « Réponse » désigne ce que la personne dit. |
| **relire** (bouton du coach) | Relire et annoter | Un seul libellé pour la même action, dans la liste et dans le parcours. |
| **rendez-vous** | séance (pour le rendez-vous avec le coach, sur les pages publiques) | « Entre deux rendez-vous ». « Séance » reste dans les guides pour les coachs, pour une séance d'atelier. |
| **coach** (rappel) | conseiller | Titres d'onglets, aide du champ du code, articles. Deux exceptions : la question « Mon conseiller m'a donné un code : est-ce le bon endroit ? », qui fait le lien pour les personnes qui disent « conseiller », et les noms de métiers (« conseillers en insertion professionnelle », équipe de la page À propos). |
| **collaborateurs en mobilité**, **acteurs publics de l'emploi** (rappel) | salariés en mobilité, financeurs de l'emploi | Y compris dans les descriptions des pages. Côté personne accompagnée, le commanditaire se dit « votre employeur » ou « l'organisme qui finance votre accompagnement ». |
| **mon espace / votre espace** (rappel) | espace d'entraînement, votre parcours (adressé à la personne) | Y compris dans le menu du compte, les descriptions des pages et les articles. |
| **un service d'IA** | « envoyé à l'assistant IA », « au service de l'assistant » | Quand le relais est branché, on dit ce qui part et vers quoi avec les mêmes mots partout : « le texte de votre entretien est envoyé à un service d'IA, jamais votre vidéo ni votre voix » ; pour l'assistant de préparation : « vos derniers messages et le métier que vous visez ». « Assistant IA » reste le nom de ce que la personne voit à l'écran. |
| **quand vous voulez**, **autant de fois que vous voulez** | lorsque vous êtes prêt, autant de fois que vous le souhaitez | Formes sans accord de genre. Dans les articles, on reformule aussi « si vous êtes invité », « pour être sûr », « vous serez plus naturel ». |
| **Organisation** (fiche d'un scénario d'usage) | Dispositif | Quatrième ligne de la fiche : « Contexte », « Public », « Durée », « Organisation ». |

**Ce que voit chacun, avec les mêmes mots.** Le coach voit seulement ce que la personne lui envoie, entretien par entretien. L'employeur et l'organisme qui finance ne voient ni les vidéos, ni les retours, ni les rapports : ils reçoivent un bilan d'ensemble, jamais une mesure individuelle. La vidéo reste sur l'appareil tant que la personne ne l'envoie pas.

**Aucun texte ne révèle une version de test.** Décision du propriétaire du 22 novembre 2026 : le site se présente comme pleinement fonctionnel. « Version d'essai », « version de démonstration », « prototype », « en mode local », « dans la version actuelle », « sur ce site », « dans ce même navigateur » et le renvoi à « Passage en production » sont retirés des textes visibles et des articles. Les deux phrases sur le fonctionnement sans serveur sont retirées : l'écran d'envoi dit seulement « Seul votre coach verra cet entretien », les articles disent « Votre coach lit l'entretien que vous lui envoyez ». Seules exceptions : le code d'essai REPETE, les identifiants coach préremplis et le message du formulaire de contact « Aucune demande envoyée, version de démonstration ». « Votre vidéo reste sur votre appareil » est une promesse de confidentialité et reste. `npm run test:content` vérifie qu'aucun texte visible ne contient « version d'essai », « prototype » ni « même navigateur ».

**« Sans frais pour vous ».** Le bandeau de l'accueil (« Sans frais pour vous · Compris dans votre accompagnement. ») et la question « Est-ce payant pour moi ? » sont publiés et disent la même chose. La mention « en attente du propriétaire » de 1.2 bis est donc dépassée : à confirmer par le propriétaire (voir ci-dessous).

**Points à valider par le propriétaire.**

1. « Entretien » ou « réponse » : tranché par le propriétaire le 22 novembre 2026, « entretien » partout (voir plus haut).
2. « Sans frais pour vous » : confirmer que la promesse vaut pour tous les accompagnements.
3. Les deux phrases sur le fonctionnement sans serveur : retirées le 22 novembre 2026 (décision du propriétaire).
4. « L'entretien de parcours professionnel remplace l'entretien professionnel » et les échéances citées (guide « Préparer votre entretien de parcours professionnel ») : affirmation juridique à faire vérifier.
5. La liste des métiers garde les formes entre parenthèses (« agent(e) d'accueil ») : elles ne sont pas des points médians, mais une liste épicène serait plus lisible.
6. Apostrophes : les articles récents emploient l'apostrophe typographique, le reste du site l'apostrophe droite. À unifier en une fois.


### 1.3 Règles de style

**Phrases.**

- Une idée par phrase. Si une phrase contient « : », « ; », « et » plus une virgule, on la coupe.
- 15 mots en moyenne, 20 au maximum côté personne accompagnée. 25 au maximum sur les pages pour professionnels.
- Sujet, verbe, complément. Présent et voix active. Pas de double négation.
- Pas d'énumération de plus de quatre éléments dans une phrase. Au-delà, c'est une liste.
- Pas de parenthèse côté personne accompagnée. Exception tranchée (RED-05) : les mentions d'interface « (facultatif) » dans un libellé de champ et « (nouvel onglet) » dans un lien qui ouvre un onglet restent entre parenthèses, comme le demande le référentiel (section 5.3) ; elles disent une propriété du champ ou du lien, pas une précision du texte.

**Ton non évaluatif.**

- « Vous pouvez… », « si vous le souhaitez », « selon le poste ». Jamais « il faut », « trop », « pas assez », « insuffisant », « bien », « mal ».
- Aucun chiffre sur 10, aucun pourcentage de réussite, aucune comparaison entre personnes.
- Aucun mot sur l'état intérieur de la personne : stress, confiance, aisance, motivation. Exception : ce qu'elle déclare elle-même.

**Écriture inclusive.**

- Pas de point médian côté personne accompagnée (« prêt·e », « senti·e ») : il gêne la lecture à voix haute, les lecteurs d'écran et les personnes peu à l'aise avec l'écrit. On reformule sans accord de genre : « quand vous voulez » plutôt que « quand vous êtes prêt·e ».
- Les phrases d'échauffement sont dites à voix haute : aucune ne doit contenir de point médian.
- Point médian toléré dans le formulaire de contact, pas ailleurs (il n'en contient pas aujourd'hui).

**Boutons et liens.**

- Un verbe d'action au début, à l'infinitif (« Ouvrir mon espace ») ou à la première personne quand la personne s'engage (« J'accepte et je commence »).
- Le libellé dit ce qui se passe au clic. Pas de « Choisir », « Valider », « OK », « Pourquoi ? » seuls.
- Deux à quatre mots. Jamais de point final.
- Une même action porte le même libellé partout. Trois libellés figés : « Ouvrir mon espace », « Me connecter à l'espace coach », « Nous contacter » (« Parler de votre projet » dans le corps des pages). Seule exception : le bouton principal du héros, « Commencer avec mon code », qui doit donner envie et dire ce qu'il faut avoir.
- Un lien dans une phrase porte sur les mots qui disent où il mène, pas sur « ici ».

**Titres.**

- Un titre dit ce que la personne va trouver ou faire. Pas de titre devinette (« Trois portes d'entrée »), pas de titre qui répète le surtitre.
- Titre de héros : deux ou trois lignes, 60 caractères au maximum.
- Pas de point final. Point d'interrogation autorisé.

**Majuscules.**

- Majuscule au premier mot seulement, pour les titres, boutons, étiquettes et onglets. Pas de majuscule à chaque mot.
- Noms propres : « La Répét' » (toujours avec l'article et l'apostrophe), « AI Act », « RGPD ».
- Minuscule pour les fonctions et les rubriques dans une phrase : « votre coach », « votre espace », « l'espace coach ».
- Capitales accentuées : « À explorer », « Échauffement ».

**Ponctuation française.**

- Espace fine insécable (U+202F) avant « ; », « ? », « ! » et à l'intérieur des guillemets « ». Espace insécable (U+00A0) avant « : » et « % », et entre un nombre et son unité ou son mot (« 2 minutes », « 12 mars », « 6 caractères », « 80 Mo »). Dans le code : le caractère lui-même (ou `\u202F`, `\u00A0`), jamais une espace simple.
- Contrôle automatique : `npm run test:content` échoue si un texte visible (JSX, chaînes, articles Markdown) contient une espace ordinaire avant « ; ? ! : » % » ou après « « » (`tests/lib/typo-fr.mjs`). Les URL, le code, les expressions régulières et les clés ne sont pas concernés.
- Dans ce document, les propositions du tableau contiennent déjà ces espaces insécables : elles peuvent être copiées telles quelles.
- Guillemets français « » uniquement.
- Aucun tiret cadratin ni demi-cadratin. Pour séparer deux éléments courts : le point médian entouré d'espaces (« Échauffement · rien n'est enregistré »). Pour une incise : deux phrases.
- Points de suspension en un seul caractère (…), réservés aux attentes (« Préparation… »).
- Nombres : en chiffres dès qu'ils comptent quelque chose à l'écran (« 6 caractères », « 3 minutes »). « 2 sur 3 » plutôt que « 2/3 », qui ressemble à une note.
- Durées : « 1 min 32 » dans les phrases, « 1:32 » sur une barre de lecture.

---

## 2. Tableau des réécritures

Lecture du tableau : **P1** = à traiter d'abord (héros, navigation, boutons, titres). Les autres lignes suivent dans l'ordre du parcours. Quand la proposition est « Supprimer », la raison dit où l'idée est déjà dite.

### 2.0 Remplacements systématiques

À appliquer partout avant le détail. Ils règlent à eux seuls la plupart des incohérences de vocabulaire.

| Fichier et élément | Texte actuel exact | Proposition | Raison |
|---|---|---|---|
| P1 · Tous les fichiers de `src/` (Counselor.jsx, About.jsx FAQ, Solutions.jsx, Resources.jsx glossaire, Report.jsx, Home.jsx VisShare, lib/analysis.js, lib/assistant.js : 11 occurrences, content/resources.js) | prise, prises | réponse, réponses | Règle de vocabulaire. Accorder au féminin, déjà le cas. |
| P1 · Home.jsx (STEPS, VisReport, VisShare, ForWho), App.jsx (Espace) | entretien (au sens d'un enregistrement) : « entretien par entretien », « Chronologie de l'entretien », « Entretien du 12 mars », « relisez les entretiens que l'on vous envoie » | réponse : « réponse par réponse », « Déroulé de votre réponse », « Réponse du 12 mars », « relisez les réponses que l'on vous envoie » | « Entretien » est réservé au vrai rendez-vous. |
| P1 · Home.jsx, Solutions.jsx, About.jsx, lib/analysis.js | Mots d'appui, mot d'appui, mots d'appui | Petits mots répétés, petit mot répété, petits mots répétés | Se confond avec « point d'appui », qui veut dire l'inverse. |
| Home.jsx, Solutions.jsx, About.jsx | Débit | Rythme de parole | Aligné sur le titre du retour dans lib/analysis.js. |
| Home.jsx (ReperesCard, VisReport) | Appui (étiquette) | Point d'appui | Terme complet du lexique, déjà utilisé dans Report.jsx. |
| Home.jsx, Report.jsx, Counselor.jsx, Solutions.jsx, About.jsx | Note du coach, Notes horodatées, note horodatée | Remarque du coach, Remarques du coach, remarque placée dans la vidéo | « Note » fait penser à une note chiffrée. |
| Beneficiary.jsx, Home.jsx, Solutions.jsx | partager, partage, partagé(e)s | envoyer, envoi, envoyé(e)s | Un seul verbe pour une seule action. |
| Beneficiary.jsx, Report.jsx, Counselor.jsx, Solutions.jsx | observation, observations (nom) | repère, repères | Un seul nom pour ce que produit l'assistant. |
| Home.jsx, Solutions.jsx, Resources.jsx | dispositif | outil | Mot courant. |
| Beneficiary.jsx, Recorder.jsx, lib/assistant.js, lib/questions.js | prêt·e, stressé·e, senti·e, ravi·e, chargé·e, seul·e, Assis·e, droit·e, Mitigé·e, tendu·e | Reformulations sans accord, détaillées plus bas | Pas de point médian côté personne accompagnée. |
| index.html `<title>`, ui.jsx `RepetLogo` (signature) | La Répét' · Coach IA d'entretien ; Coach IA d'entretien | La Répét' · S'entraîner à l'entretien d'embauche ; S'entraîner à l'entretien | P1. Le coach est un humain. « Coach IA » contredit la promesse « votre coach garde la main ». |

### 2.1 Navigation, pied de page (App.jsx)

| Fichier et élément | Texte actuel exact | Proposition | Raison |
|---|---|---|---|
| P1 · App.jsx `Nav`, étiquette de l'espace ouvert | Espace bénéficiaire | Mon espace | « Bénéficiaire » est un mot administratif, jamais affiché à la personne. |
| P1 · App.jsx `Nav`, bouton icône de sortie (les deux rôles) | Se déconnecter | Côté coach : Se déconnecter. Côté personne accompagnée : Quitter mon espace | La personne n'a pas de compte. Elle quitte l'écran, rien n'est supprimé. |
| App.jsx `Nav`, menu mobile | Déployé par | Proposé par | Mot simple, compris de tous. |
| P1 · App.jsx `Footer`, lien | FAQ | Questions fréquentes | Sigle peu connu du public visé. |
| P1 · App.jsx `Footer`, lien | Cycle de vie de la vidéo | Que devient ma vidéo ? | Même fenêtre que le bouton « Que devient ma vidéo ? » de l'enregistreur : un seul nom. |
| App.jsx `Footer`, engagement 1 | La vidéo reste sur votre appareil | Votre vidéo reste sur votre appareil | Plus direct. |
| App.jsx `Footer`, engagement 2 | Envoi au coach seulement si vous le décidez | Votre coach voit seulement ce que vous lui envoyez | Phrase avec sujet et verbe. |
| App.jsx `Footer`, engagement 3 | Sans note ni classement | Ni note ni classement | Parallèle avec les autres engagements. |
| App.jsx `Footer`, engagement 4 | Aucune émotion déduite | Aucune émotion devinée | « Déduite » est abstrait. « Deviner » est le mot de la fenêtre d'explication. |

### 2.2 Accueil : héros (Home.jsx)

| Fichier et élément | Texte actuel exact | Proposition | Raison |
|---|---|---|---|
| P1 · Home.jsx `Hero`, étiquette 1 | Assistant IA | Avec votre coach | L'étiquette actuelle ne promet rien. L'IA est nommée dans le texte juste dessous. |
| Home.jsx `Hero`, étiquette 2 | Sans note, sans jugement | Sans note, sans jugement | Conserver. C'est la promesse. |
| P1 · Home.jsx `ENDINGS` | "sans pression.", "à votre rythme.", "avec vos propres mots.", "avec confiance." | "à votre rythme.", "sans jugement.", "avec vos mots.", "en confiance." | Les quatre fins reprennent la promesse mot pour mot. « Sans pression » parle d'un état intérieur. |
| P1 · Home.jsx `Hero`, titre pour lecteurs d'écran | Répétez votre entretien d'embauche, sans pression, à votre rythme, avec vos propres mots, avec confiance. | Répétez votre entretien d'embauche, à votre rythme, sans jugement, avec vos mots, en confiance. | Suit les nouvelles fins. |
| P1 · Home.jsx `Hero`, texte d'introduction | Entraînez-vous seul, face à votre caméra, autant de fois que vous le souhaitez. Un assistant décrit votre réponse sans la noter, puis votre coach vous aide à aller plus loin. | Vous répondez à des questions d'entretien, seul, autant de fois que vous voulez. Un assistant IA décrit votre réponse, sans la noter. Vous choisissez ce que vous envoyez à votre coach. | Trois phrases, trois étapes du parcours. « Aller plus loin » était flou. L'IA est nommée. Garder le gras sur « décrit votre réponse, sans la noter ». |
| P1 · Home.jsx `Hero`, bouton principal | Lancer ma première répétition | Commencer avec mon code | Le clic mène à la saisie du code, pas à un entraînement. Le libellé dit ce qu'il faut avoir. |
| P1 · Home.jsx `Hero`, bouton secondaire | Voir les solutions | Voir comment ça marche | « Solutions » est du jargon commercial. La page ouverte commence par le déroulé. |
| P1 · Home.jsx `Hero`, ligne sous les boutons | Aucun compte à créer. Vous êtes coach ? Accéder à l'espace coach | Deux lignes séparées. Ligne 1 : Pas de compte à créer : votre coach vous donne un code d'accès. Ligne 2 : Vous êtes coach ? Connectez-vous à l'espace coach. (lien sur « Connectez-vous à l'espace coach ») | Cas signalé. Deux publics, deux lignes. La première explique d'où vient le code. |
| Home.jsx `HeroStage`, nom du carrousel | Aperçu de La Répét' | La Répét' en trois images | Dit ce que contient le carrousel. |
| Home.jsx `SCENES` 1, `label` | Question de recruteuse et aperçu du débrief | Une question de recruteuse et le retour de l'assistant | « Débrief » désignait à tort le retour de l'assistant. |
| P1 · Home.jsx `DebriefCard`, surtitre | Aperçu du débrief | Retour de l'assistant | Lexique : le débriefing est l'échange avec le coach. |
| Home.jsx `SCENES` 2, `label` | Entraînement et repères de l'assistant | Un entraînement et les repères de l'assistant | Cohérence avec les deux autres. |
| Home.jsx `ReperesCard`, ligne 3 | « euh » revient 4 fois | « Euh » revient 4 fois | Majuscule de début de ligne. |
| Home.jsx `SCENES` 3, `label` | Note horodatée du coach | Une remarque du coach | « Note » et « horodatée » : deux mots à éviter. |
| Home.jsx `SCENES` 3, `bubble.who` | Note du coach | Remarque du coach | Idem. |
| Home.jsx `RapportCard`, titre | Rapport prêt pour le débriefing | Rapport de votre coach reçu | Dit ce qui arrive à la personne. |
| Home.jsx `RapportCard`, sous-titre | Notes horodatées et commentaires sur les repères | Ses remarques, placées au bon moment de votre réponse | Sans jargon. |
| Home.jsx `HeroStage`, boutons de pause | Mettre en pause le défilement des scènes ; Reprendre le défilement des scènes | Mettre les images en pause ; Relancer les images | Plus court, même sens. |

### 2.3 Accueil : phrase, étapes, outils, engagements, portes d'entrée (Home.jsx)

| Fichier et élément | Texte actuel exact | Proposition | Raison |
|---|---|---|---|
| Home.jsx `PHRASE` | Un entretien, ça se prépare à voix haute. | Un entretien, ça se prépare à voix haute. | Conserver. Meilleure phrase du site. |
| P1 · Home.jsx `PHRASE_SUB` | Alors répétez, écoutez-vous, recommencez. À votre rythme, sans note. | Alors répétez, écoutez-vous, recommencez. | « À votre rythme » et « sans note » sont déjà dans le héros, un écran plus haut. |
| P1 · Home.jsx `Strate`, titre (et `aria-label` de la section) | Un seul dispositif, de l'entraînement au débriefing | Quatre étapes, de votre première réponse à l'échange avec votre coach | « Dispositif » est du jargon. Le titre annonce ce qui suit : quatre étapes. |
| Home.jsx `STEPS` 1, `d` | Choisissez une question adaptée au métier visé, lancez la caméra ou le micro seul, et répondez. Recommencez autant de fois que vous le souhaitez. | Choisissez une question liée au métier que vous visez. Répondez face à la caméra, ou en voix seule. Recommencez autant de fois que vous voulez. | Une idée par phrase. « Voix seule » est le terme retenu. |
| P1 · Home.jsx `STEPS` 2, `t` | L'assistant décrit ce qu'il observe | L'assistant décrit votre réponse | Reprend la formule du héros. |
| Home.jsx `STEPS` 2, `d` | Débit, pauses, exemples concrets, mots d'appui, structure, direction du regard : des faits situés dans votre réponse, sans note ni émotion déduite. | Rythme de parole, pauses, exemples, regard : il vous dit ce qu'il a remarqué, et à quel moment. Il commence par ce qui fonctionne déjà. | Six termes techniques d'affilée. « Sans note ni émotion » est dit dans le bloc suivant. |
| P1 · Home.jsx `STEPS` 3, `k` | Partager | Envoyer | Lexique. |
| P1 · Home.jsx `STEPS` 3, `t` | Vous décidez de ce que vous partagez | Vous décidez de ce que vous envoyez | Lexique. |
| Home.jsx `STEPS` 3, `d` | La vidéo reste sur votre appareil. Elle part vers votre coach seulement si vous le choisissez, entretien par entretien. | Votre vidéo reste sur votre appareil. Votre coach la voit seulement si vous la lui envoyez, réponse par réponse. | « Entretien par entretien » était faux. |
| P1 · Home.jsx `STEPS` 4, `k` | Débriefer | En parler | Mot d'entreprise peu connu du public visé. |
| P1 · Home.jsx `STEPS` 4, `t` | Votre coach annote, vous en parlez ensemble | Votre coach vous répond, vous en parlez ensemble | « Annoter » est un mot de métier. |
| Home.jsx `STEPS` 4, `d` | Votre coach relit, nuance et commente des moments précis. Son rapport sert de base au débriefing en atelier ou en rendez-vous. | Votre coach regarde votre réponse et ajoute ses remarques. Son rapport sert de point de départ à votre prochain rendez-vous ou atelier. | Verbes simples. |
| Home.jsx `Strate`, repère mobile | Étape ${active + 1} sur ${N} · ${STEPS[active].k} | Étape ${active + 1} sur ${N} · ${STEPS[active].k} | Conserver. |
| Home.jsx `VisReport`, surtitre | Chronologie de l'entretien | Déroulé de votre réponse | Lexique. |
| Home.jsx `OBS` 2, `txt` | Une expérience précise pour appuyer. | Vous citez une expérience précise. | Phrase complète, sans « appuyer » (confusion avec « appui »). |
| Home.jsx `VisShare`, titre de la carte | Entretien du 12 mars | Réponse du 12 mars | Lexique. |
| Home.jsx `VisShare`, mention | Vous pouvez supprimer une prise ou tout votre parcours à tout moment. | Vous pouvez supprimer une réponse, ou tout votre espace, à tout moment. | « Prise » et « parcours » sont bannis côté personne accompagnée. |
| Home.jsx `VisCoach`, surtitre | Relecture du coach | Remarques de votre coach | Dit ce que la personne reçoit. |
| Home.jsx `VisCoach`, dernière ligne | Débriefing en atelier jeudi | Rendez-vous avec votre coach jeudi | Tout le monde n'est pas en atelier. |
| P1 · Home.jsx `Features`, surtitre | Au fil de l'entraînement | Dans votre espace | Dit où se trouvent ces outils. |
| P1 · Home.jsx `Features`, titre | Tout ce qu'il faut pour répéter sereinement | Six outils pour vous entraîner seul | « Sereinement » promet un état intérieur. Le titre annonce six cartes. |
| Home.jsx `Features`, sous-titre | Des outils simples, pensés pour s'entraîner seul et garder la main sur ce que l'on partage. | Supprimer | Redit le titre, puis l'étape 3 située juste au-dessus. |
| Home.jsx `Features`, carte 1, texte | Des phrases à lire à voix haute pour se mettre en route. Rien n'est enregistré ni analysé. | Quelques phrases à dire à voix haute pour vous lancer. Rien n'est enregistré. | Vouvoiement direct. « Ni analysé » est superflu si rien n'est enregistré. |
| Home.jsx `Features`, carte 2, titre | Des questions adaptées au métier | Des questions liées à votre métier | Plus direct. |
| Home.jsx `Features`, carte 2, texte | Choisissez le métier visé : les questions s'y adaptent. Vous pouvez aussi ajouter les vôtres. | Indiquez le métier que vous visez. Les questions en tiennent compte. Vous pouvez ajouter les vôtres. | Une idée par phrase. |
| P1 · Home.jsx `Features`, carte 3, titre | Caméra ou micro seul | Caméra ou voix seule | Lexique : « voix seule ». |
| P1 · Home.jsx `Features`, carte 4, titre | Une transcription repérée | Votre réponse, mise par écrit | Titre incompréhensible : deux mots de métier. |
| Home.jsx `Features`, carte 4, texte | Votre réponse est transcrite sur votre appareil. Les passages utiles sont repérés, sans jugement. | Votre appareil écrit ce que vous avez dit. L'assistant y signale les passages à regarder. | « Transcrite » et « repérés » remplacés par des verbes courants. |
| P1 · Home.jsx `Features`, carte 5, titre | Un assistant pour vos questions | Une question ? Demandez à l'assistant | Même libellé que le bouton de l'écran de retour. |
| Home.jsx `Features`, carte 5, texte | Une hésitation sur un retour ou sur une question difficile ? L'assistant répond, votre coach complète. | Il explique votre retour et donne des conseils pour l'entretien. Pour votre situation personnelle, votre coach reste la bonne personne. | « Votre coach complète » était une promesse floue. |
| P1 · Home.jsx `Features`, carte 6, titre | Rapport écrit ou vidéo, au choix | Votre retour, à lire ou à regarder | « Rapport » est réservé au coach. |
| Home.jsx `Features`, carte 6, texte | Découvrez votre retour comme vous le préférez : en lisant, ou en vous revoyant avec des repères. | Lisez votre retour. Ou revoyez votre vidéo, avec les repères placés au bon moment. | Deux phrases, deux choix. |
| Home.jsx `Features`, carte 6, sélecteur | Rapport écrit ; Me revoir en vidéo | Lire mon retour ; Me revoir en vidéo | Mêmes libellés que l'écran de choix. |
| Home.jsx `NotDo`, surtitre | Le parti pris | Nos engagements | « Parti pris » est abstrait et sert aussi de surtitre sur À propos. |
| Home.jsx `NotDo`, carte 1, texte | Pas de score, pas de classement. Des observations que vous êtes libre d'utiliser. | Ni score, ni classement. L'assistant décrit, vous décidez quoi en faire. | Sujet et verbe. |
| P1 · Home.jsx `NotDo`, carte 2, titre | Aucune émotion déduite | Aucune émotion devinée | Lexique. |
| Home.jsx `NotDo`, carte 2, texte | L'assistant ne cherche ni votre humeur ni votre personnalité. Il s'en tient à ce qui se voit et s'entend. | L'assistant ne cherche pas à deviner votre humeur ni votre personnalité. Il décrit ce qui se voit et ce qui s'entend. | Verbe « deviner », partout le même. |
| P1 · Home.jsx `NotDo`, carte 3, titre | Aucun envoi sans vous | Aucun envoi sans votre accord | « Sans vous » est ambigu. |
| Home.jsx `NotDo`, carte 3, texte | Rien ne part vers votre coach sans votre accord, et vous pouvez tout supprimer. | Votre coach voit seulement ce que vous lui envoyez. Vous pouvez tout supprimer, à tout moment. | Deux idées, deux phrases. |
| P1 · Home.jsx `ForWho`, titre | Trois portes d'entrée | Par où commencer ? | Le titre actuel ne dit pas ce que l'on trouve. |
| P1 · Home.jsx `ForWho`, carte 1, titre | Un coach vous accompagne | Vous avez un code d'accès | Se reconnaître en un coup d'œil. Parallèle avec « Vous êtes coach ». |
| Home.jsx `ForWho`, carte 1, texte | Votre coach vous a remis un code de 6 caractères. Il ouvre votre espace d'entraînement, sans compte à créer. | Votre coach vous a donné un code d'accès de 6 caractères. Il ouvre votre espace. | « Sans compte à créer » est dit dans le héros. |
| P1 · Home.jsx `ForWho`, carte 1, bouton | J'ai un code | Ouvrir mon espace | Libellé figé pour cette action. |
| Home.jsx `ForWho`, carte 2, texte | Créez un parcours, transmettez le code, relisez les entretiens que l'on vous envoie et préparez vos débriefings. | Créez un parcours et transmettez le code d'accès. Relisez les réponses que l'on vous envoie. Préparez vos débriefings. | Quatre actions dans une phrase. « Entretiens » était faux. |
| P1 · Home.jsx `ForWho`, carte 2, bouton | Espace coach | Me connecter à l'espace coach | Verbe d'action. Libellé figé. |
| Home.jsx `ForWho`, carte 3, texte | Direction, DSI, juridique : découvrez comment l'outil se déploie chez vous, avec vos règles et votre hébergement. | Direction, DSI, juridique : voyez comment l'outil s'installe chez vous, avec vos règles et votre hébergement. | « Voyez » est plus direct que « découvrez ». |
| P1 · Home.jsx `ForWho`, carte 3, bouton | Pour les organismes | Voir le déploiement | Verbe d'action, dit ce que l'on trouve. |
| P1 · Home.jsx `FinalBand`, titre par défaut | Prêt pour une première répétition ? | Votre premier entraînement vous attend | Sans accord de genre. « Entraînement », pas « répétition ». |
| P1 · Home.jsx `FinalBand`, texte par défaut | Cinq minutes et votre code suffisent pour un premier entretien. | Il vous faut votre code d'accès et cinq minutes. | « Premier entretien » laissait croire à un vrai entretien. |
| P1 · Home.jsx `FinalBand`, second bouton par défaut | Voir les solutions | Supprimer | Déjà dans le héros et dans le menu. Un seul bouton en fin de page. |

### 2.4 Page « Mon espace » : choix de l'accès (App.jsx `Espace`)

| Fichier et élément | Texte actuel exact | Proposition | Raison |
|---|---|---|---|
| P1 · App.jsx `Espace`, sous-titre | Choisissez votre accès. | Vous vous entraînez, ou vous êtes coach ? | Question à laquelle les deux cartes répondent. |
| P1 · App.jsx `Espace`, étiquette carte 1 | Bénéficiaire | Je m'entraîne | Mot administratif. |
| P1 · App.jsx `Espace`, titre carte 1 | J'ai un code d'entraînement | J'ai un code d'accès | Lexique. |
| App.jsx `Espace`, texte carte 1 | Saisissez le code de 6 caractères remis par votre coach. | Écrivez les 6 caractères du code que votre coach vous a donné. | « Saisissez » et « remis » sont soutenus. |
| P1 · App.jsx `Espace` et Beneficiary.jsx `CodeEntry`, message d'erreur (3 variantes) | Ce code n'existe pas ou n'est plus actif. Vérifiez-le auprès de votre coach. ; Ce code n'existe pas ou n'est plus actif. | Ce code ne fonctionne pas. Vérifiez les 6 caractères, ou demandez-le à votre coach. | Un seul message. Il dit quoi faire d'abord. |
| App.jsx `Espace`, texte carte 2 | Créez des parcours, transmettez les codes et relisez les entretiens que l'on vous envoie. | Créez des parcours, transmettez les codes d'accès et relisez les réponses que l'on vous envoie. | Lexique. |
| P1 · App.jsx `Espace`, bouton carte 2 ; Home.jsx `Hero` ; Solutions.jsx | Accéder à l'espace coach | Me connecter à l'espace coach | Le clic ouvre un écran de connexion. Libellé figé. |

### 2.5 Entrée par le code et accord (Beneficiary.jsx `CodeEntry`, `Consent`)

| Fichier et élément | Texte actuel exact | Proposition | Raison |
|---|---|---|---|
| Beneficiary.jsx `CodeEntry`, texte | Saisissez le code transmis par votre coach, ou ouvrez directement le lien qu'il vous a envoyé. | Écrivez le code d'accès que votre coach vous a donné. | La personne est déjà sur l'écran : le lien ne lui sert plus. |
| P1 · Beneficiary.jsx `CodeEntry`, bouton | Accéder à mon espace | Ouvrir mon espace | Libellé figé. La page « Mon espace » dit déjà « Ouvrir ». |
| Beneficiary.jsx `CodeEntry`, mention | Aucun compte à créer. Ce code vous est personnel. | Ce code est à vous. Ne le donnez à personne. | « Aucun compte » est déjà dit avant. La consigne utile manquait. |
| P1 · Beneficiary.jsx `Consent`, sous-titre de l'en-tête | Cet espace est le vôtre. Vous vous entraînez à votre rythme, rien n'est noté et rien n'est partagé sans votre accord. | Deux choix avant votre premier entraînement. Rien n'est noté. Rien n'est envoyé sans votre accord. | Quatre idées en deux phrases. Le texte annonce ce que l'écran demande. |
| Beneficiary.jsx `Consent`, case 1, titre | Enregistrer et analyser mes entraînements sur cet appareil | Enregistrer mes réponses sur cet appareil | Lexique. À valider par l'audit juridique. |
| Beneficiary.jsx `Consent`, case 1, mention | · nécessaire | · obligatoire pour s'entraîner | Dit pourquoi. |
| Beneficiary.jsx `Consent`, case 1, texte | La vidéo et le son restent sur votre appareil. Ils ne sont envoyés à votre coach que si vous le décidez, réponse par réponse. | La vidéo et le son restent sur votre appareil. Votre coach les voit seulement si vous les lui envoyez, réponse par réponse. | Tournure positive plutôt que « ne… que ». |
| Beneficiary.jsx `Consent`, case 2, texte | Un retour écrit qui décrit des faits (rythme, pauses, structure, direction du regard). Il ne note pas et ne déduit aucune émotion. Sans cette option, vous pouvez quand même vous enregistrer et vous revoir. | L'assistant décrit votre réponse par écrit : rythme de parole, pauses, regard. Il ne note pas. Il ne cherche pas à deviner vos émotions. Sans cette option, vous pouvez quand même vous enregistrer et vous revoir. | Sans parenthèse. Verbe « deviner ». |
| Beneficiary.jsx `Consent`, phrase légale | Vous pouvez retirer votre consentement à tout moment depuis votre espace, sans justification. | Vous pouvez retirer votre accord à tout moment depuis votre espace, sans donner de raison. | Mots courants. Fond inchangé. À valider par l'audit juridique. |
| P1 · Beneficiary.jsx `Consent`, bouton | Je consens et je commence | J'accepte et je commence | « Consentir » est peu compris. À valider par l'audit juridique. |
| Beneficiary.jsx `EmotionNote` | On ne juge pas vos émotions. L'assistant ne cherche pas à savoir si vous êtes stressé·e : il décrit seulement des faits. | L'assistant ne cherche pas à deviner vos émotions. Il décrit seulement ce qui se voit et ce qui s'entend. (gras sur la première phrase) | Sans point médian. « On ne juge pas vos émotions » laissait entendre qu'on les observe. |
| P1 · Beneficiary.jsx `EmotionNote`, lien | Pourquoi ? | En savoir plus sur ce choix | Un lien dit où il mène. |

### 2.6 Accueil de l'espace (Beneficiary.jsx `Home`, `JobField`, `ChoiceTile`)

| Fichier et élément | Texte actuel exact | Proposition | Raison |
|---|---|---|---|
| P1 · Beneficiary.jsx `Home`, sous-titre de l'en-tête | Choisissez le métier que vous visez, puis démarrez votre entraînement : les questions s'adaptent à ce métier. Vous pouvez d'abord vous échauffer pour vous mettre en voix. | Indiquez le métier que vous visez. Puis choisissez : un échauffement ou un entraînement. | Quatre idées empilées. Le détail est dans les deux tuiles. |
| Beneficiary.jsx `JobField`, aide | Commencez à taper puis choisissez dans la liste, ou écrivez librement votre métier. | Écrivez votre métier. Vous pouvez aussi le choisir dans la liste. | Deux phrases simples. |
| Beneficiary.jsx `JobField`, confirmation | Métier enregistré : ${t}. Les questions s'adaptent à ce métier. | Métier enregistré : ${t}. Les questions en tiennent compte. | Évite la répétition de « métier ». |
| Beneficiary.jsx tuile Échauffement, texte | Quelques minutes pour vous mettre en voix, une phrase à la fois. Ni enregistré, ni analysé. | Quelques minutes pour vous lancer, une phrase à la fois. Rien n'est enregistré. | « Se mettre en voix » est du jargon de théâtre. |
| P1 · Beneficiary.jsx tuile Échauffement, bouton | Commencer par un échauffement | M'échauffer | Court. Le titre de la tuile dit déjà « Échauffement ». |
| Beneficiary.jsx tuile Échauffement, bulle d'information | L'échauffement n'est ni enregistré ni analysé. Il sert à vous mettre en voix : vous dites une phrase à voix haute, plusieurs fois, avec des astuces et des relances. Rien n'est gardé quand vous quittez l'écran. | L'échauffement sert à vous lancer. Vous dites une phrase à voix haute, plusieurs fois, en suivant une consigne. Rien n'est enregistré ni gardé. | L'idée « rien n'est enregistré » était dite deux fois. « Relance » devient « consigne ». |
| Beneficiary.jsx tuile Entraînement, texte | Vous choisissez une ou plusieurs questions et vous vous enregistrez sur cet appareil. L'assistant vous fait un retour. | Vous choisissez vos questions et vous enregistrez vos réponses. L'assistant décrit ensuite chaque réponse. | Reprend la formule du héros. Attention : cette phrase s'affiche aussi quand le retour de l'assistant est désactivé. Dans ce cas, afficher seulement la première phrase. |
| P1 · Beneficiary.jsx tuile Entraînement, bouton | Démarrer l'entraînement | Commencer l'entraînement | Même libellé que le bouton de fin d'échauffement. |
| Beneficiary.jsx tuile Entraînement, bulle (retour activé) | L'entraînement est enregistré sur votre appareil et reçoit un retour de l'assistant, qui décrit des faits sans noter. Vous décidez ensuite, réponse par réponse, de l'envoyer ou non à votre coach. | Vos réponses sont enregistrées sur votre appareil. L'assistant les décrit, sans les noter. Vous décidez ensuite, réponse par réponse, de les envoyer ou non à votre coach. | Une idée par phrase. |
| Beneficiary.jsx tuile Entraînement, bulle (retour désactivé) | L'entraînement est enregistré sur votre appareil pour que vous puissiez vous revoir. Le retour de l'assistant est désactivé à votre demande. Vous décidez, réponse par réponse, de l'envoyer ou non à votre coach. | Vos réponses sont enregistrées sur votre appareil, pour que vous puissiez vous revoir. Vous avez choisi de ne pas recevoir le retour de l'assistant. Vous décidez, réponse par réponse, de les envoyer ou non à votre coach. | Sujet « vous », plus direct. |
| P1 · Beneficiary.jsx `Home`, bandeau de rapport | vous a envoyé un rapport. Ouvrez l'entraînement concerné pour le lire. (et la variante avec ${reports.length} rapports) | vous a envoyé un rapport. Ouvrez la réponse marquée « Rapport reçu » pour le lire. | Dit laquelle ouvrir. Lexique. |
| P1 · Beneficiary.jsx `Home`, titre de liste | Mes entraînements | Mes réponses | La liste contient une ligne par réponse. |
| Beneficiary.jsx `Home`, liste vide | Vous n'avez pas encore d'entraînement enregistré. Lancez-vous quand vous êtes prêt·e. | Vous n'avez pas encore de réponse enregistrée. Commencez quand vous voulez. | Lexique. Sans point médian. |
| Beneficiary.jsx `Home`, état 2 | Envoyé, en attente de relecture | Envoyée à votre coach | Accord avec « réponse ». « En attente » peut inquiéter. |
| Beneficiary.jsx `Home`, état 3 | Sur cet appareil uniquement | Gardée sur cet appareil | Accord avec « réponse ». |
| Beneficiary.jsx `Home`, durée | ${Math.round(t.duration)} s | Format « 1 min 32 » au-delà de 60 secondes | « 92 s » se lit mal. |
| P1 · Beneficiary.jsx `Home`, lien bas de page | ← Changer de code | Utiliser un autre code | Fait doublon avec la sortie de l'en-tête sous un autre nom. Garder les deux avec ce libellé clair. |
| P1 · Beneficiary.jsx `Home`, lien de retrait | Retirer mon consentement et supprimer mes données | Retirer mon accord et tout supprimer | Lexique. À valider par l'audit juridique. |
| Beneficiary.jsx `Home`, confirmation de retrait | Retirer votre consentement supprime tous vos entraînements et vos rapports sur cet appareil. Continuer ? | Si vous retirez votre accord, toutes vos réponses et tous vos rapports sont supprimés. C'est définitif. Continuer ? | Dit la conséquence clairement. |

### 2.7 Échauffement (Beneficiary.jsx `Warmup`, `WarmupDebrief`, WarmupStage.jsx, lib/questions.js)

| Fichier et élément | Texte actuel exact | Proposition | Raison |
|---|---|---|---|
| Beneficiary.jsx `Warmup`, étiquette | Échauffement · ni enregistré, ni analysé | Échauffement · rien n'est enregistré | Plus court. |
| P1 · Beneficiary.jsx `Warmup`, titre | Mettez-vous en voix | Échauffez votre voix | Jargon de théâtre. |
| Beneficiary.jsx `Warmup`, texte | Quelques minutes pour vous habituer à parler à voix haute avant l'entraînement. L'exercice se concentre sur une seule phrase à la fois : dites-la, redites-la en suivant la relance, puis changez de phrase quand vous voulez. Rien n'est enregistré ni analysé. | Dites la phrase à voix haute. Redites-la en suivant la consigne. Changez de phrase quand vous voulez. | Trois gestes, trois phrases. « Rien n'est enregistré » est dans l'étiquette juste au-dessus. |
| P1 · Beneficiary.jsx `Warmup`, compteur | Relance {prompt + 1}/{WARMUP_PROMPTS.length} : | Consigne {prompt + 1} sur {WARMUP_PROMPTS.length} : | Lexique. « 1/7 » ressemble à une note. |
| P1 · Beneficiary.jsx `Warmup`, bouton | Relance suivante | Consigne suivante | Lexique. |
| Beneficiary.jsx `WARMUP_TIPS` 6 | Installez-vous ; Assis·e bien droit·e ou debout, les pieds à plat : la respiration est plus libre et la voix porte mieux. | Installez-vous ; Le dos droit, assis ou debout, les pieds à plat. La respiration est plus libre et la voix porte mieux. | Sans point médian. |
| Beneficiary.jsx `Warmup`, message d'accueil de l'assistant | Bonjour ! Une question sur l'échauffement, le site ou la préparation de votre entretien ? Posez-la ici, vous pouvez ensuite me demander un exemple ou plus de détails. | Bonjour ! Posez-moi une question sur l'échauffement ou sur votre entretien. Vous pouvez ensuite me demander un exemple. | Trois sujets et deux suites dans une phrase. |
| P1 · Beneficiary.jsx `Warmup`, bouton de fin | J'ai terminé l'échauffement | Terminer l'échauffement | Verbe à l'infinitif, comme les autres boutons. |
| WarmupStage.jsx, écran d'attente, titre | Un aperçu, rien de plus | Voulez-vous vous voir ? | Le titre actuel ne dit pas quoi faire. |
| WarmupStage.jsx, écran d'attente, texte | Activez la caméra pour vous voir pendant que vous parlez, ou restez en voix seule. Rien n'est enregistré. | Activez la caméra pour vous voir pendant que vous parlez. Ou restez en voix seule. | « Rien n'est enregistré » est déjà dans l'étiquette et sur l'aperçu. |
| WarmupStage.jsx, bouton | Voix seule | Rester en voix seule | Verbe d'action. |
| WarmupStage.jsx, sélecteur de fond | Fond : ; Aucun | Arrière-plan : ; Normal | « Fond : Aucun » est ambigu. |
| WarmupStage.jsx, message | Préparation du fond sur votre appareil… | Préparation de l'arrière-plan sur votre appareil… | Cohérence. |
| WarmupStage.jsx, message | Le changement de fond n'est pas disponible sur cet appareil. | Votre appareil ne permet pas de changer l'arrière-plan. | Sujet concret. |
| WarmupStage.jsx et Recorder.jsx, erreur | Caméra ou micro indisponible | Caméra ou micro introuvable | Mot plus courant. |
| lib/questions.js `WARMUP_PHRASES` 2 | Je suis ravi·e d'être ici aujourd'hui pour parler du poste de {poste}. | Merci de me recevoir aujourd'hui pour parler du poste de {poste}. | Phrase dite à voix haute : pas de point médian. |
| lib/questions.js `WARMUP_PHRASES` 5 | Dans mon dernier emploi, j'étais chargé·e d'accueillir et d'orienter le public. | Dans mon dernier emploi, j'accueillais et j'orientais le public. | Idem. |
| lib/questions.js `WARMUP_PHRASES` 8 | Je travaille bien en équipe, et je sais aussi avancer seul·e. | Je travaille bien en équipe, et je sais aussi travailler en autonomie. | Idem. |
| Beneficiary.jsx `WarmupDebrief`, texte | Vos réponses restent sur cet appareil : elles ne sont pas envoyées à votre coach. Toutes les questions sont facultatives. | Répondez si vous voulez. Vos réponses restent sur cet appareil : votre coach ne les voit pas. | Le plus important d'abord. |
| P1 · Beneficiary.jsx `WarmupDebrief`, question 1 | Comment vous êtes-vous senti·e ? | Comment vous sentez-vous après cet échauffement ? | Sans point médian. |
| lib/assistant.js `FEELINGS` | Prêt·e à continuer ; Mitigé·e ; Un peu tendu·e | Envie de continuer ; Entre les deux ; Un peu de tension | Sans point médian. Ce sont des déclarations de la personne, elles restent autorisées. |
| Beneficiary.jsx `WarmupDebrief`, aide question 3 | ${pre.length} question${pre.length > 1 ? "s" : ""} seront présélectionnées pour votre entraînement. Vous pourrez modifier ce choix. | Au singulier : 1 question sera déjà choisie pour votre entraînement. Au pluriel : ${pre.length} questions seront déjà choisies pour votre entraînement. Dans les deux cas : Vous pourrez changer. | Faute d'accord au singulier (« 1 question seront »). « Présélectionnées » est long. |
| Beneficiary.jsx `WarmupDebrief`, aide question 3 (vide) | Vos choix présélectionneront des questions pour votre entraînement. | Vos choix serviront à vous proposer des questions pour l'entraînement. | Mot simple. |

### 2.8 Choix des questions et enregistrement (Beneficiary.jsx `Pick`, vue `record`, Recorder.jsx)

| Fichier et élément | Texte actuel exact | Proposition | Raison |
|---|---|---|---|
| Beneficiary.jsx, étapes du fil | "Question", "Entraînement", "Analyse", "Retour" | "Questions", "Réponse", "Préparation", "Retour" | « Entraînement » désigne tout le fil. « Analyse » peut inquiéter. |
| Beneficiary.jsx `Pick`, texte | Sélectionnez une ou plusieurs questions, dans l'ordre où vous voulez y répondre. Vous pouvez aussi ajouter les vôtres. | Choisissez une ou plusieurs questions. Vous y répondrez dans l'ordre où vous les choisissez. Vous pouvez ajouter les vôtres. | L'ordre mérite sa phrase. |
| Beneficiary.jsx `Pick`, présélection | Présélection d'après votre échauffement : vous pouvez la modifier. | Questions choisies d'après vos réponses à l'échauffement. Vous pouvez changer. | Mot simple. |
| Beneficiary.jsx `Pick`, compteur | sélectionnée${n > 1 ? "s" : ""} ; Aucune question sélectionnée | choisie${n > 1 ? "s" : ""} ; Aucune question choisie | Même verbe que la consigne. |
| Beneficiary.jsx `Pick`, bouton | Tout désélectionner | Tout retirer | Mot simple. |
| P1 · Beneficiary.jsx vue `record`, titre | À vous. Reprenez autant que vous voulez. | À vous de répondre | Un titre, une idée. La seconde passe dans le texte. |
| Beneficiary.jsx vue `record`, texte | Aucun signal ne vous interrompt pendant l'enregistrement. Le retour vient après, et c'est vous qui décidez de le partager. | Rien ne vous interrompt pendant que vous parlez. Vous pouvez recommencer autant de fois que vous voulez. | La décision d'envoyer vient deux écrans plus loin : inutile ici. |
| P1 · Recorder.jsx, écran d'attente, titre | Prêt·e quand vous l'êtes | Quand vous voulez | Sans point médian. |
| Recorder.jsx, écran d'attente, texte | L'aperçu reste sur votre appareil. Vous pouvez aussi enregistrer uniquement votre voix. | L'image reste sur votre appareil. Vous pouvez aussi répondre en voix seule. | Lexique. |
| P1 · Recorder.jsx, bouton | Son seulement | Voix seule | Lexique. Même bouton que l'échauffement. |
| Recorder.jsx, mention voix seule | Enregistrement du son seul | Voix seule | Lexique. |
| P1 · Recorder.jsx, badge | Traitement local | Reste sur cet appareil | Jargon technique. |
| Recorder.jsx, bouton | ■ Arrêter | Arrêter l'enregistrement | Parallèle avec « Démarrer l'enregistrement ». |
| P1 · Recorder.jsx, bouton | Refaire | Recommencer | Mot utilisé partout ailleurs. |
| P1 · Recorder.jsx, `validateLabel` par défaut | Valider cette prise | Garder cette réponse | Lexique. « Valider » ne dit pas ce qui se passe. |
| Beneficiary.jsx, `validateLabel` sans retour | Enregistrer ma réponse | Garder cette réponse | La réponse est déjà enregistrée à ce stade. |
| Recorder.jsx, erreur d'accès | L'accès a été refusé. Autorisez la caméra ou le micro dans les réglages du navigateur, ou choisissez l'enregistrement du son seul. | L'accès a été refusé. Autorisez la caméra ou le micro dans les réglages du navigateur, ou choisissez « Voix seule ». | Cite le bouton. |
| Recorder.jsx, lien retour | ← Retour | Retour (avec l'icône du composant `Back`) | Une flèche tapée au clavier n'est pas lue correctement par les lecteurs d'écran. |

### 2.9 Préparation du retour et lecture (Beneficiary.jsx `Processing`, `Choose`, `TakeReport`, Report.jsx, lib/analysis.js)

| Fichier et élément | Texte actuel exact | Proposition | Raison |
|---|---|---|---|
| P1 · Beneficiary.jsx `Processing`, étape | Transcription de votre discours sur cet appareil… | Votre appareil met votre réponse par écrit… | « Transcription » et « discours » sont deux mots de métier. |
| Beneficiary.jsx `Processing`, étape | Préparation du modèle de transcription (${pr.value} %). Ce téléchargement n'a lieu qu'une fois. | Téléchargement de l'outil d'écriture (${pr.value} %). C'est seulement la première fois. | Sans jargon. |
| Beneficiary.jsx `Processing`, mention | Aucune émotion n'est déduite : le retour décrit uniquement des faits observables. | Tout se passe sur votre appareil. Cela peut prendre un moment. | Troisième rappel de la même idée en trois écrans. Ici, la personne veut savoir pourquoi elle attend. |
| P1 · Beneficiary.jsx `Processing`, titre d'erreur | La transcription n'a pas pu aboutir | Votre réponse n'a pas pu être mise par écrit | Lexique. |
| Beneficiary.jsx `Processing`, texte d'erreur | Vérifiez votre connexion (le modèle se télécharge au premier usage) puis réessayez. | Vérifiez votre connexion à Internet, puis réessayez. | Sans parenthèse ni jargon. |
| Beneficiary.jsx `Processing`, bouton | Refaire l'enregistrement | Recommencer ma réponse | Lexique. |
| Beneficiary.jsx `Processing`, synthèse sans retour | Le retour de l'assistant est désactivé à votre demande. Vous pouvez revoir votre réponse et la partager à votre coach. | Vous avez choisi de ne pas recevoir le retour de l'assistant. Vous pouvez revoir votre réponse et l'envoyer à votre coach. | Lexique. |
| P1 · Beneficiary.jsx `Choose`, titre | Comment préférez-vous le découvrir ? | Comment voulez-vous voir votre retour ? | Le pronom « le » renvoyait à une étiquette. |
| P1 · Beneficiary.jsx `Choose`, option 1, titre | Un rapport écrit | Lire mon retour | « Rapport » est réservé au coach. |
| Beneficiary.jsx `Choose`, option 1, texte | Vous lisez les observations tranquillement, sous forme de texte. Idéal si vous n'aimez pas vous revoir. | Vous lisez ce que l'assistant a remarqué. Pratique si vous n'aimez pas vous revoir. | Lexique. |
| Beneficiary.jsx `Choose`, option 2, texte | Chaque observation est placée sur la barre de lecture. Cliquez un repère ou une observation : la lecture s'y place. | Vous revoyez votre réponse. Chaque repère est placé au bon moment : touchez-le pour y aller. | Deux noms pour la même chose dans la même phrase. « Touchez » vaut aussi sur téléphone. |
| P1 · Beneficiary.jsx `Choose`, boutons | Choisir (deux fois) | Lire ; Me revoir | Deux boutons identiques côte à côte. |
| P1 · Beneficiary.jsx `TakeReport`, bascule | Plutôt un rapport écrit ; Plutôt me revoir en vidéo | Lire mon retour ; Me revoir en vidéo | Mêmes libellés que l'écran de choix. |
| Beneficiary.jsx `TakeReport`, fin de question | Prenez le temps de lire ce retour, puis passez à la suite quand vous êtes prêt·e. | Prenez le temps de lire ce retour. Passez à la suite quand vous voulez. | Sans point médian. |
| Beneficiary.jsx `TakeReport` et `Sent`, bouton | Question suivante ({series.i + 2}/{series.n}) | Question suivante ({series.i + 2} sur {series.n}) | « 2/3 » ressemble à une note. |
| P1 · Beneficiary.jsx `TakeReport`, invitation à envoyer | Prêt·e à en parler avec (nom du coach ou « votre coach ») ? | Envie d'en parler avec (nom du coach ou « votre coach ») ? | Sans point médian. |
| Beneficiary.jsx `TakeReport`, bouton | Supprimer | Supprimer cette réponse | Dit ce qui est supprimé. |
| Beneficiary.jsx `TakeReport`, bouton | Imprimer ou PDF | Imprimer | Un verbe. La boîte d'impression propose le PDF. |
| P1 · Beneficiary.jsx `Sent`, bouton | M'entraîner à nouveau | M'entraîner encore | Même libellé que sur l'écran de retour. |
| Report.jsx `ReportBody`, résumé | En deux mots. | En résumé. | Le texte fait plus de deux mots. |
| Report.jsx `ReportBody`, message par défaut | Votre coach a relu votre prise. | Votre coach a regardé votre réponse. | Lexique. |
| P1 · Report.jsx `ReportBody`, titre | Notes horodatées | Remarques de votre coach | Lexique. |
| Report.jsx `Player`, légende | Note du coach | Remarque du coach | Lexique. |
| lib/analysis.js, titres des repères | Captation du son ; Structure du propos ; Vocabulaire | Son enregistré ; Construction de la réponse ; Mots qui reviennent | Mots courants. « Vocabulaire » ne disait pas de quoi il s'agit. |
| lib/analysis.js, synthèse courte | La prise est très courte ou la voix a été peu captée. Vous pouvez recommencer en vous rapprochant du micro, rien n'est enregistré sans votre accord. | Votre réponse est très courte, ou le micro vous a peu entendu. Vous pouvez recommencer en vous rapprochant du micro. | Lexique. La fin n'avait pas de rapport avec le problème. |
| lib/analysis.js, synthèse | Points d'appui repérés : ${appuis.join(", ")}. Les autres repères sont des pistes à explorer si vous le souhaitez. | Vos points d'appui : ${appuis.join(", ")}. Les autres repères sont des pistes, à explorer si vous le souhaitez. | Plus direct. |
| lib/analysis.js, synthèse sans point d'appui | Les repères ci-dessous décrivent votre prise. Ce sont des pistes à explorer, à votre rythme. | Les repères ci-dessous décrivent votre réponse. Ce sont des pistes, à explorer si vous le souhaitez. | Lexique. |
| lib/analysis.js, conseil pauses | Quelques pauses rythment le propos et laissent le temps de réfléchir. C'est une ressource. | Quelques pauses rythment la réponse et laissent le temps de réfléchir. Vous pouvez les garder. | « C'est une ressource » est du jargon. |
| lib/analysis.js, conseil pauses | Les pauses sont nombreuses. Préparer deux ou trois mots-clés par question peut aider à enchaîner. | Préparer deux ou trois mots-clés par question peut aider à enchaîner. | « Nombreuses » évalue. Le repère donne déjà le nombre. |

### 2.9 bis Analyse d'un entretien : textes alignés sur les promesses du site (22 novembre 2026)

Le site promet : l'assistant IA analyse l'entretien, sans le noter ; il commence par les points d'appui, puis propose des pistes. Textes et consignes mis en accord, après l'essai de `docs/essai-analyse/`.

| Élément | Avant | Maintenant | Raison |
|---|---|---|---|
| lib/analysis.js, synthèse | Vos points d'appui : (liste). Les autres repères sont des pistes, à explorer si vous le souhaitez. | Vos points d'appui : (liste). Une piste pour votre prochain essai : (une seule). Les autres pistes sont à explorer si vous le souhaitez. | Une priorité nommée, donc une action possible. |
| lib/analysis.js, synthèse sans point d'appui | Les repères ci-dessous décrivent votre réponse. | Les repères ci-dessous analysent votre entretien, sans le noter. Une piste pour votre prochain essai : (une seule). | Lexique du 22 novembre. |
| lib/analysis.js, conseils | Préparer deux ou trois mots-clés par question peut aider à enchaîner. ; Marquer un temps de silence à la place […] suffit souvent. | Avant de commencer, vous pouvez noter deux ou trois mots-clés […]. ; Au prochain essai, vous pouvez marquer un court silence à la place […]. | Chaque piste dit quoi faire, et quand. |
| lib/analysis.js, nouveau repère | (absent) | Durée : Vous parlez pendant 0:18. En entretien, une réponse dure souvent entre 1 et 2 minutes. […] | Un entretien très court ne recevait que des points d'appui de forme. |
| Report.jsx, groupes | cartes à la suite | Vos points d'appui (Ce qui fonctionne déjà. Vous pouvez le garder.) puis Vos pistes à explorer (Des propositions pour le prochain essai. Ce ne sont pas des erreurs.) | L'ordre promis se lit à l'écran. |
| legal.js `feedbackLlm` | Texte rédigé avec l'aide d'une IA. | Texte rédigé avec l'aide d'une IA, à partir de ce qui a été mesuré dans l'entretien, puis vérifié par un filtre. Le coach peut le nuancer ou le contredire. | Mention placée sous le résumé, côté personne et côté coach. |
| lib/llm.js, consigne envoyée au modèle | Reformule le retour […] | Prompt système `FEEDBACK_SYSTEM_PROMPT` : « entretien », « analyse », points d'appui puis une piste, pistes actionnables, longueurs, interdits | Le texte du modèle suit la même charte que le site. Non visible à l'écran. |

### 2.10 Envoi au coach (Beneficiary.jsx `Share`, `Sent`) et assistant (Assistant.jsx)

| Fichier et élément | Texte actuel exact | Proposition | Raison |
|---|---|---|---|
| Beneficiary.jsx `Share`, étiquette | Partage · vous décidez | Envoi · vous décidez | Lexique. |
| Beneficiary.jsx `Share`, texte | Votre réponse enregistrée et le retour de l'assistant seront transmis uniquement à votre coach. Vous pouvez la supprimer à tout moment. | Votre coach recevra votre réponse et le retour de l'assistant. Personne d'autre ne les verra. Vous pourrez supprimer cette réponse à tout moment. | Le pronom « la » était ambigu. Une idée par phrase. |
| P1 · Beneficiary.jsx `Share`, bouton | Envoyer | Envoyer à mon coach | Même libellé que le bouton qui mène ici. Dit à qui. |
| P1 · Beneficiary.jsx `Sent`, texte | va relire votre réponse et y ajouter ses remarques. Vous retrouverez son rapport dans votre espace, avec ce même code, et vous en parlerez ensemble en atelier. | va regarder votre réponse et ajouter ses remarques. Son rapport arrivera dans votre espace. Vous y revenez avec le même code. | Trois idées empilées. « En atelier » n'est pas vrai pour tous. |
| P1 · Assistant.jsx, titre par défaut | Posez directement votre question | Une question ? Demandez à l'assistant | « Directement » ne veut rien dire ici. Même formule que les autres écrans. |
| Assistant.jsx, sous-titre | Assistant · fonctionnement du site et préparation d'entretien | Il répond sur La Répét' et sur la préparation de l'entretien | Phrase plutôt qu'étiquette. |
| Assistant.jsx, mention (réponses locales) | Les réponses sont préparées sur cet appareil : vos questions n'en sortent pas. Ne saisissez pas d'informations personnelles. | Vos questions restent sur cet appareil. N'écrivez pas d'informations personnelles. | Plus court. |
| Assistant.jsx, mention (service distant) | Vos questions sont transmises au service de l'assistant, sans aucune image ni son. Ne saisissez pas d'informations personnelles. | Vos questions sont envoyées au service de l'assistant, sans image ni son. N'écrivez pas d'informations personnelles. | Mots courants. |
| lib/assistant.js, réponse de repli | Je n'ai pas de réponse précise à cette question. Je peux vous aider sur le fonctionnement de La Répét' et sur la préparation d'un entretien ; pour votre situation personnelle, votre coach est la bonne personne. Vous pouvez par exemple me demander : | Je n'ai pas de réponse à cette question. Je peux vous aider sur La Répét' et sur la préparation d'un entretien. Pour votre situation personnelle, votre coach est la bonne personne. Vous pouvez par exemple me demander : | Point-virgule remplacé par deux phrases. |

### 2.11 Espace coach (Counselor.jsx, lib/store.js)

| Fichier et élément | Texte actuel exact | Proposition | Raison |
|---|---|---|---|
| P1 · Counselor.jsx, sous-titre de l'espace | Les personnes que vous accompagnez dans le module entretien | Vos parcours et les réponses que l'on vous a envoyées | « Module entretien » est un reste d'une autre architecture. |
| P1 · Counselor.jsx, bouton | Mes bénéficiaires | Mes parcours | L'écran liste des parcours. Lexique. |
| P1 · Counselor.jsx, bouton | Nouveau parcours | Créer un parcours | Verbe d'action. Même libellé que l'écran vide. |
| Counselor.jsx `Login`, texte | Accédez à vos parcours et aux prises que l'on vous a envoyées. | Retrouvez vos parcours et les réponses que l'on vous a envoyées. | Lexique. |
| Counselor.jsx `List`, indicateur 1 | Prises à relire | Réponses à relire | Lexique. |
| Counselor.jsx `List`, indicateur 2 | Parcours ouverts | Parcours en cours | « Ouverts » se confond avec « lien ouvert par la personne ». |
| Counselor.jsx `List`, indicateur 4 | Bénéficiaires qui se réentraînent | Personnes qui se réentraînent | Lexique. |
| Counselor.jsx `List`, indicateur 4 sans donnée | Le tiret demi-cadratin affiché quand il n'y a pas de donnée | Aucune donnée (ou laisser la case vide avec ce texte pour les lecteurs d'écran) | Tiret demi-cadratin interdit. |
| Counselor.jsx `List`, mention | Indicateurs agrégés uniquement, sans mesure de performance individuelle. | Ces chiffres portent sur l'ensemble de vos parcours. Aucun ne mesure une personne. | « Agrégés » est du jargon. |
| Counselor.jsx `List`, ligne | prise${takes.length > 1 ? "s" : ""} · créé le | réponse${takes.length > 1 ? "s" : ""} · créé le | Lexique. |
| lib/store.js `parcoursStatus`, état | Code transmis | Pas encore ouvert | L'outil ne sait pas si le code a été transmis. Il sait seulement que l'espace n'a pas été ouvert. |
| Counselor.jsx `Create`, titre | Créer un parcours pour une personne accompagnée | Créer un parcours | L'étiquette juste au-dessus dit déjà « Nouveau parcours ». Supprimer cette étiquette. |
| Counselor.jsx `Create`, texte | Un code personnel est généré. La personne n'a aucun compte à créer. | Vous obtenez un code d'accès à transmettre. La personne n'a pas de compte à créer. | Lexique. Voix active. |
| Counselor.jsx `Create`, aide prénom | Seul identifiant affiché. Ni numéro d'identifiant, ni adresse électronique. | Par exemple : Alex D. N'indiquez ni nom complet, ni numéro de dossier, ni adresse électronique. | Consigne claire avec un exemple. |
| P1 · Counselor.jsx `Create`, champ | Poste ou secteur visé | Métier visé | Même libellé que dans l'espace de la personne. |
| Counselor.jsx `Create`, aide métier | Sert à contextualiser les questions, jamais à fixer une norme. | Les questions en tiennent compte. La personne peut le modifier. | Jargon. Information utile ajoutée. |
| Counselor.jsx `Create`, champ | Première session | Pour commencer | Lexique. |
| Counselor.jsx `Create`, choix | Proposer un échauffement sans analyse ; Directement l'entraînement | Proposer d'abord un échauffement ; Aller directement à l'entraînement | Deux verbes parallèles. |
| P1 · Counselor.jsx `Create`, bouton | Générer le code | Créer le parcours | Dit ce qui se passe. Le code s'affiche à l'écran suivant. |
| Counselor.jsx `Created`, texte | Transmettez le code ou le lien. Il sert à tout : s'entraîner, partager une prise, recevoir le rapport. | Transmettez le code d'accès ou le lien à ${p.prenom}. Il lui sert à s'entraîner, à vous envoyer une réponse et à lire votre rapport. | « Il sert à tout » est flou. Lexique. |
| P1 · Counselor.jsx `Created`, bouton | Ouvrir l'espace bénéficiaire sur cet appareil | Ouvrir son espace sur cet appareil | Lexique. Voir aussi la section 4. |
| Counselor.jsx `Parcours`, état | consentement recueilli le ; , sans retour de l'assistant ; lien ouvert, consentement non recueilli ; lien pas encore ouvert | accord donné le ; , sans retour de l'assistant ; espace ouvert, accord pas encore donné ; espace pas encore ouvert | Lexique. |
| P1 · Counselor.jsx `Parcours`, titre | Prises partagées | Réponses reçues | Lexique. Point de vue du coach. |
| Counselor.jsx `Parcours`, mention (autres réponses) | autre(s) prise(s) reste(nt) privée(s) : vous n'y avez pas accès. | autre(s) réponse(s) n'a (n'ont) pas été envoyée(s) : vous ne la (les) voyez pas. | Lexique. « Privées » suggérait un réglage. |
| Counselor.jsx `Parcours`, mention (par défaut) | Seules les prises que la personne a choisi d'envoyer apparaissent ici. | Vous voyez ici seulement les réponses que la personne vous a envoyées. | Lexique. |
| Counselor.jsx `Parcours`, liste vide | Aucune prise partagée pour le moment. | Aucune réponse reçue pour le moment. | Lexique. |
| P1 · Counselor.jsx `Parcours`, bouton | Revoir | Modifier le rapport | Le clic rouvre le rapport envoyé, qui peut être modifié et renvoyé. |
| Counselor.jsx `Parcours`, confirmation | Supprimer le parcours de ${p.prenom}, ses prises et ses rapports ? | Supprimer le parcours de ${p.prenom}, ses réponses et ses rapports ? C'est définitif. | Lexique. Conséquence dite. |
| Counselor.jsx `Review`, titre de carte | Ajouter une note au moment en cours de lecture | Ajouter une remarque à ce moment de la vidéo | Lexique. |
| Counselor.jsx `Review`, bouton icône | Supprimer la note | Supprimer la remarque | Lexique. |
| Counselor.jsx `Review`, titre de carte | Le mot de ${p.prenom} à l'envoi | Le message de ${p.prenom} | Plus simple. |
| Counselor.jsx `Review`, bouton dépliant | Afficher la transcription | Afficher le texte de la réponse | Lexique. |
| P1 · Counselor.jsx `Review`, exemple dans le champ | ${p.prenom}, j'ai regardé ta prise… | ${p.prenom}, j'ai regardé votre réponse… | Tutoiement suggéré et « prise ». Le coach reste libre de tutoyer. |
| P1 · Counselor.jsx `Review`, surtitre | Observations de l'assistant | Repères de l'assistant | Lexique. |
| Counselor.jsx `Review`, message vide | Pas d'observation automatique pour cette prise. | L'assistant n'a pas de repère pour cette réponse. | Lexique. |
| Counselor.jsx `Review`, exemple dans le champ | Votre remarque sur cette observation (facultatif) | Votre remarque sur ce repère (facultatif) | Lexique. |
| Counselor.jsx `Review`, confirmation d'envoi | le retrouve dans son espace, avec son code. Vos remarques apparaissent à côté de chaque observation. | le retrouve dans son espace, avec son code. Vos remarques apparaissent à côté de chaque repère. | Lexique. |

### 2.12 Page « Solutions » (Solutions.jsx)

| Fichier et élément | Texte actuel exact | Proposition | Raison |
|---|---|---|---|
| P1 · Solutions.jsx, titre du héros | Du premier entraînement au débriefing, pour chaque acteur | Ce que La Répét' apporte à chacun | « Acteur » est du jargon. Le titre annonce le plan de la page. |
| Solutions.jsx, introduction | La Répét' relie trois publics autour d'un même parcours : la personne qui s'entraîne, le coach qui l'accompagne et l'organisme qui déploie l'outil. | Un même outil pour trois publics : la personne qui s'entraîne, le coach qui l'accompagne, l'organisme qui le met en place. | « Parcours » a un sens précis dans l'outil. |
| P1 · Solutions.jsx, section déroulé, titre | Un seul lien pour tout le parcours | Sept étapes, chacune décidée par une personne | « Lien » se lit comme une adresse web. Le titre ne disait pas ce que montre le schéma. |
| Solutions.jsx, section déroulé, sous-titre | Chacun sait ce qu'il a à faire, et rien ne passe d'une étape à l'autre sans une décision humaine. | Rien ne passe d'une étape à la suivante sans que quelqu'un le décide. | Une idée. |
| Solutions.jsx `Flow`, étape 3 | l'assistant décrit | l'assistant décrit sa réponse | Phrase complète. |
| Solutions.jsx `Flow`, étape 4 | partage une prise | envoie une réponse | Lexique. |
| Solutions.jsx `Flow`, étape 5 | annote ; contextualise, nuance | relit ; ajoute ses remarques | Verbes simples. |
| P1 · Solutions.jsx, bouton personnes accompagnées | Lancer ma première répétition | Commencer avec mon code | Même bouton que le héros de l'accueil. |
| Solutions.jsx `BENEF` 5 | Un retour qui décrit ; Débit, pauses, exemples concrets, mots d'appui, structure, regard. Points d'appui d'abord. | Un retour qui décrit ; Rythme de parole, pauses, exemples, petits mots répétés, regard. Ce qui fonctionne déjà est présenté en premier. | « Mots d'appui » puis « points d'appui » dans la même carte. |
| Solutions.jsx `BENEF` 6 | Rapport écrit ou vidéo ; Lire un rapport, ou se revoir avec des repères cliquables sur la barre de lecture. | Un retour à lire ou à regarder ; Lire le retour, ou se revoir avec les repères placés au bon moment de la vidéo. | Lexique. |
| Solutions.jsx `BENEF` 8 | Envoi volontaire ; Chaque prise reste sur l'appareil tant que la personne ne décide pas de l'envoyer. | Envoi volontaire ; Chaque réponse reste sur l'appareil tant que la personne ne l'envoie pas. | Lexique. Plus court. |
| Solutions.jsx `BENEF` 9 | Une prise, un parcours, ou le retrait du consentement, qui efface les prises. | La personne peut supprimer une réponse. Elle peut aussi retirer son accord : toutes ses réponses sont alors effacées. | Trois objets et une relative dans une phrase. |
| P1 · Solutions.jsx, section coachs, titre | Garder la main, gagner du temps de relecture | Relire, nuancer, préparer le débriefing | « Gagner du temps » est une promesse sans preuve. |
| Solutions.jsx `COACH` 1 | Parcours en quelques secondes | Un parcours vite créé | Pas de durée promise. |
| Solutions.jsx `COACH` 3 | Notes horodatées ; Mettez en pause, écrivez : la note se place au moment précis de la vidéo. | Remarques placées dans la vidéo ; Mettez en pause, écrivez : votre remarque se place à ce moment de la vidéo. | Lexique. |
| Solutions.jsx `COACH` 4 | Confirmez, nuancez ou contredisez chaque observation. Votre commentaire prime. | Confirmez, nuancez ou contredisez chaque repère. Votre lecture prime. | Lexique. Même formule que dans l'espace coach. |
| Solutions.jsx `COACH` 5 | Rapport sous contrôle ; Rien ne part sans votre envoi. Brouillon automatique, rapport renvoyable après modification. | Rien ne part sans vous ; Votre brouillon s'enregistre tout seul. Vous envoyez le rapport quand il est prêt. Vous pouvez le corriger et le renvoyer. | Titre flou, style télégraphique. |
| P1 · Solutions.jsx, section assistant, titre | Ce qu'il observe, et ce qu'il n'observe pas | Ce que l'assistant observe, et ce qu'il n'observe pas | « Il » n'avait pas d'antécédent dans le titre. |
| Solutions.jsx, section assistant, sous-titre | Des faits situés dans la réponse, présentés comme des repères et jamais comme une note. | Des faits, situés à un moment précis de la réponse. Jamais une note. | Deux phrases courtes. |
| Solutions.jsx `OBSERVE` 4 | « euh » revient 4 fois, surtout en début de phrase. | « "Euh" revient 4 fois, surtout en début de phrase. » | Les sept autres exemples sont entre guillemets, pas celui-ci. |
| Solutions.jsx, encadré assistant, dernière phrase | Tout retour contenant une note ou un vocabulaire émotionnel est écarté automatiquement. | Un filtre écarte tout retour qui contient une note ou un mot sur les émotions. | Voix active. |
| Solutions.jsx `ORG` Direction, point 2 | Des indicateurs agrégés uniquement : prises à relire, parcours, rapports, réentraînement, délai moyen de relecture. Aucune mesure individuelle. | Des chiffres d'ensemble uniquement : réponses à relire, parcours, rapports envoyés, délai moyen de relecture. Aucune mesure individuelle. | Lexique. Cinq éléments ramenés à quatre. |
| Solutions.jsx `ORG` Juridique, point 3 | Consentement granulaire, tracé et retirable ; le retrait supprime les prises. | Consentement donné option par option, daté et retirable. Le retrait supprime les réponses. | « Granulaire » est du jargon, même pour un DPO. |
| P1 · Solutions.jsx, bandeau final, titre | Voir La Répét' avec votre équipe | Envie de voir l'outil en situation ? | Presque identique au titre de la page Démo, où mène le bouton. |
| P1 · Solutions.jsx et About.jsx, bandeau final, second bouton | Ouvrir mon espace | Supprimer | Ces bandeaux parlent aux organismes. Le bouton est déjà dans l'en-tête. |

### 2.13 Page « À propos » et questions fréquentes (About.jsx)

| Fichier et élément | Texte actuel exact | Proposition | Raison |
|---|---|---|---|
| P1 · About.jsx, titre du héros | Rendre l'entraînement à l'entretien accessible, sans jamais noter | S'entraîner à l'entretien, sans jamais être noté | Plus court. Tient sur deux lignes. |
| P1 · About.jsx, introduction | La Répét' est née dans un organisme d'accompagnement vers l'emploi, d'un constat simple : un entretien se prépare à voix haute, et l'on progresse quand on peut recommencer sans être jugé. | Un entretien se prépare à voix haute. Et l'on progresse quand on peut recommencer sans être jugé. La Répét' est construite sur ces deux idées. | Trois idées dans une phrase. L'origine du projet est à vérifier : voir la section 4. |
| About.jsx `MISSION` 2, texte | Un retour qui décrit des faits situés dans la réponse, jamais une note. | L'assistant dit ce qu'il a remarqué, et à quel moment. Jamais de note. | « Faits situés » est abstrait. |
| About.jsx `MISSION` 3, texte | Le coach relit ce qu'on lui envoie, nuance, et prépare le débriefing. | Le coach relit ce qu'on lui envoie, ajoute ses remarques et prépare le débriefing. | Verbe complet. |
| About.jsx, encadré, surtitre | Un exemple de repère | Noter ou décrire : un exemple | Annonce la comparaison. |
| P1 · About.jsx, section principes, surtitre | Le parti pris | Nos principes | Même surtitre que sur l'accueil pour un autre contenu. |
| About.jsx `PRINC` 02 | Des conventions, pas des vérités ; Chaque repère est une convention de secteur, variable selon le poste et la culture, jamais une qualité personnelle universelle. | Des usages, pas des règles ; Un repère renvoie aux usages d'un métier. Ils changent selon le poste et l'entreprise. Ce n'est jamais un jugement sur la personne. | « Convention de secteur » et « qualité personnelle universelle » sont du jargon. |
| About.jsx `PRINC` 03, texte | La personne choisit ce qu'elle partage ; le coach contextualise, contredit si besoin, et décide de ce qui est renvoyé. | La personne choisit ce qu'elle envoie. Le coach peut nuancer ou contredire l'assistant. Il décide de ce qu'il renvoie. | Une idée par phrase. Lexique. |
| About.jsx `PRINC` 04, texte | Un échauffement sans analyse ni conservation, puis le choix du mode de retour : rapport écrit ou vidéo. | Un échauffement sans enregistrement. Puis un retour à lire ou à regarder, au choix. | « Mode de retour » est du jargon. Lexique. |
| About.jsx, section « Pour qui », surtitre | Pour qui | À qui s'adresse La Répét' | Même surtitre que sur l'accueil. |
| About.jsx, liste « Pour qui », ligne 2 | Les coachs et conseillers | Les coachs | Lexique : un seul mot. |
| P1 · About.jsx, section FAQ, titre | FAQ | Vos questions, nos réponses | Le surtitre dit déjà « Questions fréquentes ». Sigle peu connu. |
| About.jsx `FAQ`, compte | Non. Votre coach vous remet un code de 6 caractères qui ouvre votre espace. Aucune adresse électronique ni mot de passe n'est demandé. | Non. Votre coach vous donne un code d'accès de 6 caractères. Il ouvre votre espace. On ne vous demande ni adresse électronique ni mot de passe. | Une idée par phrase. Lexique. |
| About.jsx `FAQ`, vidéo, paragraphe 1 | Non, tant que vous ne décidez pas de l'envoyer à votre coach. L'enregistrement, la transcription et l'analyse se font dans votre navigateur. | Non, tant que vous ne l'envoyez pas à votre coach. Tout se fait sur votre appareil : l'enregistrement, la mise par écrit et le retour de l'assistant. | « Navigateur » et « transcription » remplacés. |
| About.jsx `FAQ`, vidéo, paragraphe 2 | Au premier usage, le navigateur télécharge les modèles d'analyse (transcription et suivi du regard). Ce téléchargement ne transmet aucune donnée personnelle. | La première fois, votre appareil télécharge les outils nécessaires. Cela peut prendre un moment. Aucune donnée personnelle n'est envoyée à cette occasion. | Sans jargon. |
| About.jsx `FAQ`, note | Jamais. L'assistant décrit ce qu'il observe (débit, pauses, exemples, mots d'appui, structure, regard), en commençant par ce qui fonctionne. Il ne déduit ni émotion ni trait de personnalité. | Jamais. L'assistant décrit votre réponse : rythme de parole, pauses, exemples, regard. Il commence par ce qui fonctionne déjà. Il ne cherche à deviner ni vos émotions ni votre personnalité. | Sans parenthèse. Lexique. |
| About.jsx `FAQ`, sans caméra | Oui, en voix seule. Le suivi du regard est alors désactivé, le reste du retour reste disponible. | Oui, en voix seule. L'assistant ne décrit alors pas votre regard. Le reste du retour ne change pas. | « Reste… reste » dans la même phrase. |
| About.jsx `FAQ`, suppression | Oui, à tout moment : une prise, votre parcours, ou le retrait de votre accord, qui supprime vos prises et vos vidéos. | Oui, à tout moment. Vous pouvez supprimer une réponse. Vous pouvez aussi retirer votre accord : toutes vos réponses et vos vidéos sont alors supprimées. | Une idée par phrase. Lexique. |
| About.jsx `FAQ` coachs, question 1 | Est-ce que je vois toutes les prises ? ; Non. Vous voyez uniquement les prises que la personne choisit de vous envoyer, avec le mot qu'elle y a joint. | Est-ce que je vois toutes les réponses ? ; Non. Vous voyez seulement les réponses que la personne choisit de vous envoyer, avec le message qu'elle a joint. | Lexique. |
| About.jsx `FAQ` coachs, question 2 | Oui. Vous pouvez commenter chaque observation pour la confirmer, la nuancer ou la contredire. Votre commentaire apparaît à côté de l'observation dans le rapport. | Oui. Vous pouvez commenter chaque repère pour le confirmer, le nuancer ou le contredire. Votre commentaire apparaît à côté du repère dans le rapport. | Lexique. |
| About.jsx `FAQ` coachs, question 3 | Cela dépend de vous : quelques notes horodatées et un mot d'introduction suffisent souvent. Un brouillon est enregistré automatiquement, vous pouvez reprendre plus tard. | Cela dépend de vous. Quelques remarques dans la vidéo et un mot d'introduction suffisent souvent. Votre brouillon s'enregistre tout seul : vous pouvez reprendre plus tard. | Lexique. |
| About.jsx `FAQ` coachs, question 4 | Oui. Les prises partagées servent de support au débriefing. | Oui. Les réponses reçues servent de support au débriefing. | Lexique. |
| About.jsx `FAQ` coachs, question 5 | Non. Les indicateurs sont agrégés (prises à relire, rapports envoyés, réentraînement, délai moyen de relecture). Aucune mesure de performance individuelle n'est proposée. | Non. Les chiffres portent sur l'ensemble des parcours : réponses à relire, rapports envoyés, délai moyen de relecture. Aucun ne mesure une personne ni un coach. | Sans parenthèse ni jargon. |
| About.jsx `FAQ` organismes, AI Act | Il est conçu pour : aucune reconnaissance d'émotion, transparence sur le rôle de l'assistant, supervision humaine, absence de notation. | Il est conçu pour s'y conformer : aucune reconnaissance d'émotion, transparence sur le rôle de l'assistant, supervision humaine, aucune notation. | « Conçu pour : » est bancal. Fond inchangé. |

### 2.14 Centre de ressources (Resources.jsx, content/resources.js)

| Fichier et élément | Texte actuel exact | Proposition | Raison |
|---|---|---|---|
| P1 · Resources.jsx `Hub`, titre du héros | Le centre de ressources de La Répét' | Des conseils pour préparer votre entretien | Le titre actuel répète le surtitre et ne promet rien. |
| Resources.jsx `Hub`, introduction | Des conseils concrets pour préparer un entretien d'embauche, des guides pour prendre l'outil en main, et des scénarios d'usage pour les équipes. | Des conseils concrets pour l'entretien d'embauche. Des guides pour utiliser La Répét'. Des exemples d'usage pour les équipes. | Trois familles, trois phrases. |
| P1 · Resources.jsx `Hub`, section thèmes | Explorer ; Par thème | Thèmes ; Choisissez un thème | Titre trop court pour dire quoi faire. |
| P1 · Resources.jsx `Hub`, section liste | Toutes les ressources (surtitre) ; Tous les articles (titre) | Rechercher (surtitre) ; Toutes les ressources (titre) | « Ressource » et « article » pour la même chose. |
| P1 · Resources.jsx `Article`, section suite | Articles liés | Sur le même thème | Lexique. |
| Resources.jsx `CategoryView`, filtres par type | {TYPES[t]}s (affiche « Scénario d'usages ») | Prévoir un pluriel par type : Guides ; Scénarios d'usage | Faute : le « s » s'ajoute au mauvais mot. |
| Resources.jsx `Article`, bandeau scénario, titre | Envisager ce dispositif chez vous ? | Et dans votre organisme ? | Lexique. Plus direct. |
| Resources.jsx `Article`, mention scénario | Organisation fictive et générique. Les effets décrits sont des hypothèses, sans résultat mesuré. | Organisme fictif. Ce scénario décrit un usage possible. Aucun résultat n'a été mesuré. | Conserver l'honnêteté, en plus simple. |
| Resources.jsx `NotFound`, texte | Elle a peut-être été renommée. Retrouvez tous les articles dans le centre de ressources. | Elle a peut-être changé d'adresse. Retrouvez toutes les ressources ci-dessous. | Lexique. |
| P1 · Resources.jsx `NotFound`, bouton | Voir les ressources | Voir toutes les ressources | Même libellé que le bouton de fin de ressource. |
| content/resources.js, catégorie `guides`, description | Prendre en main l'outil côté personne accompagnée, pas à pas. | Utiliser La Répét' pas à pas, quand on s'entraîne. | « Côté personne accompagnée » est un mot d'équipe. |
| content/resources.js, catégorie `coachs`, description | Créer des parcours, relire les prises, animer un débriefing. | Créer des parcours, relire les réponses, animer un débriefing. | Lexique. |
| P1 · Resources.jsx `GLOSSARY`, entrée | Prise ; Un enregistrement de votre réponse à une question. Vous pouvez en faire autant que vous le souhaitez. | Réponse ; Ce que vous enregistrez pour une question. Vous pouvez recommencer autant de fois que vous voulez. | Lexique. |
| Resources.jsx `GLOSSARY`, entrée | Repère ; Une observation de l'assistant, située à un moment de votre réponse : débit, pause, exemple, regard. | Repère ; Une chose que l'assistant a remarquée, à un moment précis de votre réponse. Par exemple : une pause, un exemple, la direction de votre regard. | Lexique. |
| Resources.jsx `GLOSSARY`, entrée | Point d'appui ; Un repère sur ce qui fonctionne déjà dans votre réponse. Ils sont toujours présentés en premier. | Point d'appui ; Un repère sur ce qui fonctionne déjà dans votre réponse. Les points d'appui sont toujours présentés en premier. | « Ils » n'avait pas d'antécédent au pluriel. |
| Resources.jsx `GLOSSARY`, entrée | À explorer ; Un repère sur une piste que vous pouvez travailler, présentée comme une convention et non comme une erreur. | À explorer ; Un repère sur une piste que vous pouvez travailler, si vous le voulez. Ce n'est pas une erreur. | « Convention » est du jargon. |
| Resources.jsx `GLOSSARY`, entrée | Parcours ; L'espace créé par votre coach pour vous, ouvert avec un code de 6 caractères. | Remplacer par deux entrées. Votre espace : L'endroit où vous vous entraînez et retrouvez vos réponses. Vous l'ouvrez avec votre code d'accès. Code d'accès : Les 6 caractères que votre coach vous donne. Ils ouvrent votre espace. | « Parcours » n'est jamais affiché à la personne. |
| Resources.jsx `GLOSSARY`, entrée | Transcription ; Le texte de votre réponse, produit automatiquement dans votre navigateur. | Supprimer, et ajouter trois entrées. Retour : Ce que l'assistant écrit sur votre réponse. Il décrit, il ne note pas. Rapport : Ce que votre coach vous renvoie après avoir regardé votre réponse. Échauffement : Quelques phrases à dire à voix haute avant l'entraînement. Rien n'est enregistré. | Le mot « transcription » disparaît de l'interface. Les trois mots ajoutés y sont partout. |

### 2.15 Demande de démo (Demo.jsx), devenue « Nous contacter »

> Depuis le repositionnement (1.2 bis), la page s'adresse aux commanditaires : nom, fonction, type de structure (acteur public ou entreprise), structure, coordonnées, public accompagné, nombre de personnes, échéance, message. Les lignes ci-dessous sont historiques.

| Fichier et élément | Texte actuel exact | Proposition | Raison |
|---|---|---|---|
| Demo.jsx, titre du héros | Découvrir La Répét' avec votre équipe | Voir La Répét' avec votre équipe | « Voir » est plus concret. |
| Demo.jsx, introduction | Une démonstration de 45 minutes environ : le parcours de la personne accompagnée, la relecture côté coach, puis vos questions sur le déploiement, l'hébergement et le cadre juridique. | Une démonstration de 45 minutes environ. Nous montrons l'entraînement d'une personne, puis la relecture par le coach. Nous répondons ensuite à vos questions sur le déploiement, l'hébergement et le cadre juridique. | Une phrase de 33 mots. La durée est un engagement : voir la section 4. |
| P1 · Demo.jsx, bouton d'envoi | Envoyer ma demande | Préparer ma demande | Le clic n'envoie rien : il ouvre la messagerie ou affiche un récapitulatif. |
| Demo.jsx, case d'accord | J'accepte d'être recontacté·e au sujet de cette demande. Mes coordonnées servent uniquement à organiser la démonstration. | J'accepte que l'on me recontacte au sujet de cette demande. Mes coordonnées servent uniquement à organiser la démonstration. | Sans point médian. |
| Demo.jsx, encart, point 1 | Code d'accès, échauffement, enregistrement, retour descriptif, envoi au coach. | Code d'accès, échauffement, réponse enregistrée, retour de l'assistant, envoi au coach. | Lexique. |
| Demo.jsx, encart, point 2 | Notes horodatées, commentaires sur les repères, rapport et débriefing. | Remarques dans la vidéo, commentaires sur les repères, rapport et débriefing. | Lexique. |
| Demo.jsx `Done`, lien | Ouvrir à nouveau ma messagerie | Rouvrir ma messagerie | Plus court. |

### 2.16 Textes légaux (legal.jsx) : ton uniquement

Le fond juridique n'est pas touché. Ces remarques portent sur la forme et la cohérence avec le reste.

| Fichier et élément | Texte actuel exact | Proposition | Raison |
|---|---|---|---|
| legal.jsx `LegalModal`, bouton | J'ai compris | Fermer | Le bouton ferme une fenêtre. Il ne doit pas faire déclarer à la personne qu'elle a compris. |
| legal.jsx `LegalModal`, bouton de fermeture | ✕ | Icône du jeu d'icônes, avec le nom accessible « Fermer » déjà présent | Un caractère tapé au clavier rend mal selon les polices. |
| legal.jsx `lifecycle`, titre | Le cycle de vie de votre vidéo | Que devient ma vidéo ? | Même nom que le bouton et le lien qui ouvrent cette fenêtre. |
| legal.jsx `lifecycle`, résumé | 🔐 En résumé : | Icône du jeu d'icônes à la place de l'émoji | Les émojis ne sont utilisés nulle part ailleurs. |
| legal.jsx `lifecycle`, étape 3 et 4 | Tant que vous ne partagez pas ; Si vous partagez (ou demandez à la rejouer) | Tant que vous n'envoyez rien ; Si vous envoyez (ou demandez à la rejouer) | Lexique, si l'audit juridique le permet. |
| legal.jsx `emotion`, titre | Pourquoi on n'analyse pas vos émotions | Pourquoi l'assistant ne cherche pas à deviner vos émotions | « On » est flou. Même verbe que dans l'interface. |

---

## 3. Répétitions repérées et arbitrages

Règle générale : une promesse se dit une fois par écran, à l'endroit où elle rassure. Le pied de page porte déjà les quatre engagements sur toutes les pages : il compte comme une occurrence.

| Idée répétée | Où elle apparaît aujourd'hui | Où garder | Où couper |
|---|---|---|---|
| « Sans note », « décrit sans noter », « ne note pas » | Accueil : étiquette du héros, texte du héros, sous-phrase, étape 2, bloc engagements, pied de page (6 fois). Espace : sous-titre de l'accord, case 2, bulle Entraînement, en-tête du retour. À propos : titre, mission, récit, principe 01, FAQ. Solutions : section assistant, garanties, onglet juridique. | Accueil : étiquette et texte du héros, bloc engagements. Espace : case 2 de l'accord, en-tête du retour (« Ce retour décrit des faits, il ne note pas »). À propos : titre, principe 01, FAQ. Solutions : section assistant. | Accueil : sous-phrase et étape 2. Espace : sous-titre de l'accord réduit à trois mots, bulle Entraînement allégée. À propos : carte mission 2. Solutions : garanties. |
| « Aucune émotion déduite » | Accueil : étape 2, bloc engagements, pied de page. Espace : case 2 de l'accord, encart de l'écran d'enregistrement, écran d'attente du retour. Solutions : encadré assistant, garanties, onglet juridique. À propos : récit, cadre réglementaire, FAQ. | Accueil : bloc engagements. Espace : case 2 de l'accord, encart de l'enregistrement (avec son lien). Solutions : encadré assistant, onglet juridique. À propos : cadre réglementaire, FAQ. | Accueil : étape 2. Espace : écran d'attente (remplacé par une information sur l'attente). Solutions : garanties. |
| « La vidéo reste sur votre appareil », « rien ne part sans vous » | Accueil : étape 3, sous-titre des outils, engagement 3, pied de page (4 fois). Espace : case 1 de l'accord, bulle Entraînement, écran d'attente de l'enregistreur, carte d'envoi, écran d'envoi. Solutions : carte envoi volontaire, sous-titre coachs, garanties. FAQ. | Accueil : étape 3 (c'est son sujet), engagement 3. Espace : case 1 de l'accord, carte d'envoi sous le retour. Solutions : carte envoi volontaire. FAQ. | Accueil : sous-titre des outils (supprimé). Espace : le badge « Reste sur cet appareil » suffit sur l'enregistreur. Solutions : garanties. |
| « Aucun compte à créer » | Héros, carte « Un coach vous accompagne », écran du code, FAQ, Solutions (carte accès par code), création de parcours côté coach. | Héros (ligne sous les boutons), FAQ, Solutions, création de parcours. | Carte de l'accueil, écran du code (la personne est déjà en train d'entrer). |
| « À votre rythme » | Fin de titre du héros, sous-phrase, titre de la mission (À propos), section « Pour qui », sous-titre de l'accord, onglet Direction, bandeau de fin de ressource, synthèse du retour. | Fin de titre du héros, titre de la mission, bandeau de fin de ressource. | Sous-phrase, sous-titre de l'accord, synthèse du retour (remplacée par « si vous le souhaitez »). |
| « Autant de fois que vous le souhaitez » | Texte du héros, étape 1, titre de l'écran d'enregistrement, glossaire, mission. | Texte du héros, étape 1, texte de l'écran d'enregistrement. | Ailleurs, une fois par page suffit. Harmoniser en « autant de fois que vous voulez ». |
| « Rien n'est enregistré ni analysé » (échauffement) | Tuile, bulle, étiquette de l'écran, paragraphe, écran d'attente de l'aperçu, mention voix seule, badge « Non enregistré », noms accessibles de la vidéo (8 fois sur deux écrans). | Tuile, étiquette de l'écran, badge « Non enregistré » sur l'aperçu. | Paragraphe, écran d'attente, seconde phrase de la bulle. |
| Les outils de l'espace (échauffement, questions par métier, caméra ou voix, retour, assistant, choix lire ou regarder) | Accueil : six cartes. Solutions : neuf cartes, dont les six mêmes. | Les deux, car les lecteurs diffèrent. Accueil : adressé à la personne, en « vous ». Solutions : adressé aux professionnels, à la troisième personne. | Rien à couper dans les cartes. La redite gênante de la page Solutions est la section « Garanties » (ligne suivante). |
| Les quatre garanties | Solutions : section « Garanties » (4 cartes). Les quatre sont déjà dites plus haut dans la page et dans le pied de page juste en dessous. Trois sont aussi le bloc engagements de l'accueil. | Accueil : bloc engagements. Pied de page partout. | Solutions : supprimer la section « Garanties ». |
| « Conçu pour l'AI Act et le RGPD » | À propos : titre de section (« dès le départ »). Solutions : badge du héros, titre de l'onglet « Juridique et DPO ». | À propos : titre de section. Solutions : titre de l'onglet. | Solutions : badge du héros, remplacé par « Hébergé par votre organisme », qui est l'argument propre à cette page. |
| Les quatre étapes du parcours | Accueil : quatre étapes. Solutions : sept étapes. À propos : mission en trois cartes, puis « prototype fonctionnel » qui redonne la boucle. | Accueil (version courte) et Solutions (version complète). | À propos : ne pas redérouler la boucle dans « Comment c'est construit ». |
| Surtitres identiques pour des contenus différents | « Le parti pris » : accueil et À propos. « Pour qui » : accueil et À propos. | Voir les réécritures : « Nos engagements » et « Nos principes » ; « Pour qui » sur l'accueil, « À qui s'adresse La Répét' » sur À propos. | |
| Boutons « Voir les solutions » | Accueil : héros et bandeau final. | Héros, sous le libellé « Voir comment ça marche ». | Bandeau final. |
| Paire « Demander une démo » et « Ouvrir mon espace » | En-tête (toutes les pages), bandeaux de fin de Solutions et d'À propos. | En-tête. Bandeaux : « Demander une démo » seul. | Second bouton des bandeaux. |
| Deux écrans pour saisir le code | Page « Mon espace » (`Espace`) et écran `CodeEntry` de l'espace : titres, textes, boutons et messages d'erreur différents pour la même action. | Un seul jeu de textes : titre « J'ai un code d'accès », champ « Votre code d'accès », bouton « Ouvrir mon espace », un seul message d'erreur. | Le titre « Bienvenue sur La Répét' » peut rester en surtitre de `CodeEntry`. |
| Deux façons de quitter l'espace | Bouton icône « Se déconnecter » dans l'en-tête et lien « ← Changer de code » en bas de l'espace. | Les deux, car l'un est toujours visible et l'autre proche des réglages. | Leur donner des libellés cohérents : « Quitter mon espace » et « Utiliser un autre code ». |
| « Que devient ma vidéo ? » et « Cycle de vie de la vidéo » | Bouton de l'enregistreur et de l'échauffement, lien du pied de page, lien de l'accord, titre de la fenêtre. | « Que devient ma vidéo ? » partout. | « Cycle de vie de la vidéo » partout. |
| Titre de la page Démo et bandeau de Solutions | « Découvrir La Répét' avec votre équipe » et « Voir La Répét' avec votre équipe ». | Page Démo. | Bandeau de Solutions, réécrit en question. |
| Six libellés pour démarrer un entraînement | « Démarrer l'entraînement », « Commencer l'entraînement », « Commencer (2 questions) », « M'entraîner encore », « M'entraîner à nouveau », « Lancer ma première répétition ». | « Commencer l'entraînement » (première fois), « Commencer (2 questions) » (après le choix), « M'entraîner encore » (fois suivantes). | Les trois autres. |

---

## 4. Points à trancher par le propriétaire

Ces textes ne peuvent pas être réécrits sans une décision ou une vérification. Ils touchent aux deux règles « aucun texte de démonstration » et « rien d'inventé présenté comme réel ». Aucune réécriture n'est proposée tant que le fait n'est pas confirmé, pour ne rien affirmer de faux.

### 4.1 Textes qui décrivent un prototype ou une démonstration

| Fichier et élément | Texte actuel exact | Décision attendue |
|---|---|---|
| App.jsx `Espace` et Beneficiary.jsx `CodeEntry` | Champ du code prérempli avec `TRIAL_CODE` | En version opérationnelle, le champ doit être vide. Sinon tout visiteur ouvre un espace d'essai sans le savoir. |
| Counselor.jsx `Login` | Adresse et mot de passe préremplis (`TRIAL_LOGIN`) | Même décision. Tant que la connexion est simulée, l'écran « Connexion » promet une protection qui n'existe pas. |
| Demo.jsx, encart | Envie d'essayer d'abord ? Le code d'essai est déjà rempli dans Mon espace. | À supprimer en version opérationnelle. Si un essai public est voulu, le dire franchement : « Essayer avec un espace de démonstration ». |
| Demo.jsx `Done` (sans adresse de contact) | L'envoi en ligne des demandes n'est pas encore activé sur ce site : aucune donnée n'a été transmise ni conservée. Pour organiser la démonstration, contactez l'équipe de {ORG_NAME} qui déploie La Répét', en lui transmettant votre demande. | Renseigner `VITE_CONTACT_EMAIL` en version opérationnelle, pour que cet écran ne s'affiche jamais. Un formulaire qui n'aboutit à rien n'a pas sa place en production. |
| About.jsx, section « Comment c'est construit » | De la conception au prototype ; étapes « Prototype fonctionnel » et « Mise en production » | Soit la section décrit l'état réel à la date de mise en ligne, soit elle disparaît. Titre conseillé si elle reste : « Où en est le projet ». |
| About.jsx `FAQ` organismes | Dans le prototype actuel, dans le navigateur de l'appareil utilisé (localStorage pour les informations, IndexedDB pour les vidéos). Le coach et la personne doivent donc utiliser le même appareil pour que la boucle fonctionne. | Réponse à réécrire selon l'hébergement réel. Si le même appareil reste nécessaire, la promesse « votre coach relit à distance » de tout le site est fausse et doit être nuancée partout. |
| About.jsx `FAQ` organismes | Le prototype se construit avec Node.js (npm run build) et se publie sur n'importe quel hébergement statique. | Une commande de terminal n'a pas sa place dans une FAQ publique. Renvoyer vers la documentation technique. |
| Solutions.jsx, section organismes, sous-titre et onglet DSI | y compris sur ce qui reste à faire pour passer du prototype à la production ; Aujourd'hui ; Pour la production ; Ce qui reste à faire | Même arbitrage : décrire l'état réel, ou retirer. |
| About.jsx `FAQ` et `LAW` | des documents de travail à valider ; Un audit RGAA complet fait partie des étapes de mise en production. | À mettre à jour quand l'audit juridique et l'audit d'accessibilité sont rendus. |
| Counselor.jsx `Created` | Ouvrir l'espace bénéficiaire sur cet appareil | Bouton utile seulement en démonstration sur un appareil partagé. À retirer si le coach et la personne ont chacun leur appareil. |

### 4.2 Affirmations à vérifier

| Fichier et élément | Texte actuel exact | Question |
|---|---|---|
| About.jsx, introduction | La Répét' est née dans un organisme d'accompagnement vers l'emploi | Est-ce exact et l'organisme accepte-t-il d'être évoqué ? Sinon, utiliser la proposition du tableau 2.13, qui n'affirme rien. |
| About.jsx, section récit | Ce que nous avons observé sur le terrain ; Dans les ateliers de préparation aux entretiens, le temps manque. Chacun ne peut s'exercer qu'une ou deux fois […] | Observations réelles de l'équipe ? Si oui, garder. Sinon, écrire « Ce que disent les coachs » avec une source, ou passer au conditionnel. |
| About.jsx, section récit | Les outils du marché proposent souvent des scores, des jauges ou des analyses d'émotions. | Généralisation sur des concurrents. Conseillé : « Certains outils proposent des scores, des jauges ou des analyses d'émotions. » |
| About.jsx `BUILD` | un benchmark qui a conclu à une construction interne plutôt qu'à un achat | Le benchmark existe-t-il et peut-il être communiqué sur demande ? |
| Demo.jsx, introduction | Une démonstration de 45 minutes environ | Durée réellement tenue ? Sinon retirer le chiffre. |
| Home.jsx `FinalBand` | Cinq minutes et votre code suffisent | Vrai à la première visite, téléchargement des outils compris ? Sinon écrire « quelques minutes ». |
| Home.jsx, visuels du héros et des étapes | « Environ 140 mots par minute », « Entretien du 12 mars », « Débriefing en atelier jeudi », prénom « Sami » | Ce sont des illustrations d'interface, pas des témoignages : acceptable. Ajouter « Exemple » en surtitre de ces vignettes lèverait tout doute. |
| Beneficiary.jsx `Sent` | vous en parlerez ensemble en atelier | Tous les organismes ne font pas d'atelier. Corrigé dans le tableau 2.10. |
| Solutions.jsx `COACH` | Parcours en quelques secondes ; gagner du temps de relecture | Promesses de temps non mesurées. Corrigées dans le tableau 2.12. |

### 4.3 Hors périmètre de cette relecture

- Les articles de `src/content/resources/*.md` n'ont été que survolés. Deux titres contiennent « prise » (« Relire une prise et préparer le débriefing », résumé de « Votre première répétition, pas à pas ») : à aligner sur le lexique lors de leur réécriture.
- `src/lib/assistant.js` : survol seulement. Onze occurrences de « prise » et plusieurs points médians dans les réponses de l'assistant. Appliquer le lexique et la règle d'écriture inclusive à toute la base.
- Apostrophes : le code utilise l'apostrophe droite. Le passage à l'apostrophe typographique peut se faire en une fois sur tout le site, à part de ce chantier.

> 22 novembre 2026 : le message du formulaire de contact reste exactement « Aucune demande envoyée, version de démonstration », texte demandé par le propriétaire (seule exception à la règle « aucun texte visible ne révèle une version de test »).
