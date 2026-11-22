/* Questions fréquentes (page #/ressources/faq et mini FAQ de l'accueil). Une entrée : [question, réponse], la réponse
   étant un texte ou une liste de paragraphes. Vouvoiement côté personne accompagnée, aucune note, aucun chiffre
   inventé. La question sur le coût pour la personne accompagnée attend la validation du propriétaire : ne pas
   l'ajouter sans son accord (rapport du panel bénéficiaires, 21 novembre 2026). */

export const FAQ_COST = ["Est-ce payant pour moi ?", "Non. L'accès à La Répét' est compris dans votre accompagnement. Vous n'avez rien à payer."];
export const FAQ_TIME = ["Combien de temps faut-il ?", "Une réponse dure 3 minutes au plus. Un premier entraînement prend quelques minutes. Vous vous entraînez quand vous voulez, aussi souvent que vous le souhaitez."];
export const FAQ_DEVICE = ["Faut-il un matériel particulier ?", "Non. Un téléphone suffit. Un ordinateur fonctionne aussi, avec une caméra et un micro, ou un micro seul. La première fois, votre appareil télécharge un outil d'environ 130 Mo : le Wi-Fi est préférable. Sur les appareils modestes, la mise par écrit peut prendre un peu plus de temps."];
export const FAQ_EMPLOYER = ["Je suis en entreprise : mon employeur voit-il mes réponses ?", ["Non. Seul votre coach voit les réponses que vous choisissez de lui envoyer. Votre employeur ne reçoit qu'un bilan d'ensemble de l'accompagnement, sans information sur vous en particulier.", "Conseil : entraînez-vous de préférence sur un appareil personnel plutôt que sur votre ordinateur professionnel."]];
export const FAQ_ACCOUNT = ["Faut-il créer un compte ?", "Non. Votre coach vous donne un code d'accès de 6 caractères. Il ouvre votre espace. On ne vous demande ni adresse électronique ni mot de passe."];

export const FAQ = [
  { id: "personnes-accompagnees", title: "Personnes accompagnées", items: [
    FAQ_COST,
    FAQ_TIME,
    FAQ_ACCOUNT,
    FAQ_DEVICE,
    ["Ma vidéo est-elle envoyée quelque part ?", ["Non, tant que vous ne l'envoyez pas à votre coach. Tout se fait sur votre appareil : l'enregistrement, la mise par écrit et le retour de l'assistant.", "La première fois, votre appareil télécharge les outils nécessaires (environ 130 Mo). Votre vidéo et votre voix ne sont pas envoyées. Comme pour tout site, le serveur qui fournit ces fichiers voit l'adresse internet (IP) de votre appareil. Le détail est dans « Vos données »."]],
    ["Est-ce que je reçois une note ?", "Jamais. L'assistant décrit votre réponse : rythme de parole, pauses, exemples, regard. Il commence par ce qui fonctionne déjà. Il ne cherche à deviner ni vos émotions ni votre personnalité."],
    ["Pourquoi n'y a-t-il pas d'avatar ?", ["Parce que, pour progresser, l'essentiel est de dire votre réponse à voix haute, de recevoir un retour précis, puis de recommencer. Dans les études sur l'entraînement aux entretiens, c'est surtout ce retour qui fait la différence, plus que la présence d'un personnage à l'écran.", "La question vous est donc lue par une voix, comme lors d'un appel de présélection au téléphone. Sans visage à surveiller, vous restez sur ce que vous dites, et l'outil fonctionne sur un simple téléphone. Ce choix évite aussi toute confusion : La Répét' ne se fait pas passer pour un recruteur et ne lit jamais vos émotions.", "Aucune étude n'a encore comparé les deux façons de faire dans un outil comme le nôtre. C'est un choix que nous assumons, et votre coach reste la personne qui vous accompagne. Si vous préférez sentir une présence, vous pouvez afficher une vignette d'interlocuteur, caméra coupée, comme en visio. Nos raisons et leurs limites sont sur la page « Recherche en accompagnement »."]],
    ["Comment voir ce qui a changé d'un entraînement à l'autre ?", ["Vos réponses restent dans votre espace, chacune avec son retour. Vous pouvez en relire deux et regarder ce qui a changé : un exemple ajouté, des pauses à d'autres moments, un autre rythme de parole.", "Il n'y a ni note, ni jauge, ni courbe. Votre coach vous aide à faire le point, à partir des réponses que vous choisissez de lui envoyer."]],
    ["Puis-je m'entraîner sans caméra ?", "Oui, en voix seule. L'assistant ne décrit alors pas votre regard. Le reste du retour ne change pas."],
    FAQ_EMPLOYER,
    ["Puis-je tout supprimer ?", "Oui, à tout moment. Vous pouvez supprimer une réponse. Vous pouvez aussi retirer votre accord : toutes vos réponses et vos vidéos sont alors supprimées."],
    ["Mon conseiller m'a donné un code : est-ce le bon endroit ?", "Oui. Votre conseiller est votre coach sur La Répét'. Cliquez sur « Mon compte » en haut de la page, puis saisissez son code dans « J'ai un code d'accès »."],
    ["Que faire si j'ai perdu mon code ?", "Demandez-le à votre coach : il le retrouve dans son espace."],
  ] },
  { id: "coachs", title: "Coachs", items: [
    ["Est-ce que je vois toutes les réponses ?", "Non. Vous voyez seulement les réponses que la personne choisit de vous envoyer, avec le message qu'elle a joint."],
    ["Pourquoi un entraînement sans avatar ?", ["C'est un choix de conception, pas un résultat prouvé : aucune étude ne compare un avatar et une voix seule dans un outil comme le nôtre. Les essais menés avec un recruteur virtuel donnent des résultats encourageants, sur de petits échantillons, et ne séparent pas l'effet du personnage de celui du retour.", "Nous avons retenu ce que la recherche sur l'apprentissage décrit : dire sa réponse à voix haute, recevoir un retour précis, recommencer. Une voix lit la question, sans visage à surveiller, et l'outil reste léger. La personne s'entraîne seule ; la relation se construit avec vous. Les huit raisons, leurs limites et les sources sont sur la page « Recherche en accompagnement »."]],
    ["Puis-je contredire l'assistant ?", "Oui. Vous pouvez commenter chaque repère pour le confirmer, le nuancer ou le contredire. Votre commentaire apparaît à côté du repère dans le rapport."],
    ["Combien de temps demande une relecture ?", "Cela dépend de vous. Quelques remarques dans la vidéo et un mot d'introduction suffisent souvent. Votre brouillon s'enregistre tout seul : vous pouvez reprendre plus tard."],
    ["Puis-je utiliser l'outil en atelier collectif ?", "Oui. Les réponses reçues servent de support au débriefing. Montrer un extrait au groupe demande toujours l'accord explicite de la personne."],
    ["Existe-t-il un classement des personnes ou des coachs ?", "Non. Les chiffres portent sur l'ensemble des parcours : réponses à relire, rapports envoyés, délai moyen de relecture. Aucun ne mesure une personne ni un coach."],
    ["Comment créer un parcours ?", "Dans l'espace coach, « Créer un parcours » : prénom et initiale, métier ou poste visé. Le code d'accès et le lien sont prêts à transmettre à la personne."],
  ] },
  { id: "commanditaires", title: "Commanditaires", items: [
    ["Que proposez-vous exactement ?", "Un accompagnement à la préparation des entretiens, mené par nos coachs : entretien d'embauche, de mobilité, annuel ou professionnel. La Répét' est l'outil d'entraînement de cet accompagnement. Nous ne vendons pas l'outil seul."],
    ["Pour quels publics ?", ["Les demandeurs d'emploi, dans le cadre d'un accompagnement vers l'emploi, d'un retour à l'emploi ou d'un parcours d'insertion.", "Les collaborateurs d'entreprise : mobilité interne ou externe, préparation d'un entretien de mobilité, d'un entretien annuel ou professionnel, reconversion."]],
    ["Que voit le commanditaire ?", "Un bilan d'ensemble de l'accompagnement, défini avec vous avant le démarrage. Jamais les vidéos, les retours de l'assistant ni les rapports des coachs, et jamais une mesure individuelle."],
    ["Où sont stockées les données ?", ["Les entraînements restent dans le navigateur de l'appareil de la personne, tant qu'elle ne les envoie pas.", "Les réponses envoyées et les rapports sont gardés par notre organisme, pour la durée validée par notre délégué à la protection des données. Le détail est dans « Vos données »."]],
    ["L'outil est-il conforme à l'AI Act ?", "Il est conçu pour s'y conformer : aucune reconnaissance d'émotion, transparence sur le rôle de l'assistant, supervision humaine, aucune notation. Notre organisme mène la qualification réglementaire complète avec son délégué à la protection des données."],
    ["Une analyse d'impact (AIPD) est-elle nécessaire ?", "Oui. Le public accompagné et l'usage d'une technologie nouvelle la rendent nécessaire avant tout démarrage. Elle revient à notre organisme, responsable du traitement."],
    ["Combien coûte un accompagnement ?", "Cela dépend du public, du nombre de personnes, de la durée et du format (rendez-vous individuels, ateliers). Nous construisons une proposition avec vous après un premier échange."],
    ["Comment démarrer ?", "Décrivez votre projet sur la page « Nous contacter » : type de structure, public accompagné, nombre de personnes, échéance. Nous revenons vers vous pour un premier échange."],
  ] },
];
