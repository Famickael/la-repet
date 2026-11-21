# Voix des questions : point de reprise

*Mis à jour le 21 novembre 2026, par Claude (session orchestratrice). Sujet en pause, à reprendre dans la session « La Répét' : synthèse vocale de meilleure qualité », ou dans toute session ouverte sur ce dépôt.*

## 1. La demande

- La voix qui lit les questions d'entretien est jugée **trop robotique**.
- Le porteur veut une voix **naturelle, sans accent étranger**, capable de s'adapter **à toutes les questions et surtout au brief du bénéficiaire** (questions et relances personnalisées), et pas seulement à une banque de questions fixe.

## 2. Ce qui est fait

**PR #31 (branche `claude/voix-naturelle`)**, CI verte, **non fusionnée** :
- `src/lib/voice.js` choisit la meilleure voix française **locale** de l'appareil (fr-FR d'abord, puis « Premium », « Enhanced », voix standard) et écarte les voix réseau (Edge « Online (Natural) », « Google français »). Débit de 0,9 à 0,95.
- Test `npm run test:voice`, branché dans `verifier.yml` et `AGENTS.md`. Mise à jour de `docs/etat-fonctionnel.md`.
- Étude chiffrée d'une voix neuronale locale (Piper `fr_FR-siwis-medium` : 63 Mo ; Kokoro écarté) dans le corps de la PR.
- **Rôle désormais prévu : repli** quand la voix de qualité est indisponible. Elle reste utile même avec la solution retenue ci-dessous.

**Essais d'écoute par le porteur** :

| Voix | Verdict |
|---|---|
| Voix de base macOS (Thomas compacte, Jacques, Amélie fr-CA) | Insuffisantes. C'est ce qu'ont la plupart des visiteurs |
| Piper siwis (locale, neuronale) | Meilleure des voix locales, mais insuffisante |
| OpenAI (openai.fm), voix par défaut d'ElevenLabs | Accent anglophone gênant : ce sont des voix anglophones qui parlent français |
| **ElevenLabs « Ingrid »** (voix française native) | **Choisie** |

## 3. Le choix retenu : ElevenLabs, voix Ingrid

- Nom : **Ingrid – Warm, Calm and Authentic**. Identifiant : `FFXYdAYPzn8Tw8KiHZqg`.
- Caractéristiques : français, accent standard, voix féminine, catégorie « professional ».
- Clé API (Mac mini) : `~/.config/la-repet/elevenlabs.env` (`export ELEVENLABS_API_KEY=…`, droits 600). **Jamais dans le dépôt.**
  - Restreinte à *Text to Speech* (accès) et *Voix* (lecture), avec un plafond de crédits.
  - Clé ré-émise après une exposition accidentelle. La clé actuelle a été vérifiée valide (HTTP 200 sur `/v2/voices`).
- Lecture de la clé sans l'afficher : `K=$(sed -n 's/^export ELEVENLABS_API_KEY=//p' ~/.config/la-repet/elevenlabs.env)`. Utiliser `curl` : le Python python.org du Mac mini n'a pas les certificats HTTPS (`CERTIFICATE_VERIFY_FAILED`).

## 4. Blocage actuel : décision en attente du porteur

L'offre **gratuite** d'ElevenLabs refuse les voix de bibliothèque par l'API : `402 paid_plan_required` (« Free users cannot use library voices via the API »).

| Option | Questions fixes | Questions adaptées au brief | Licence commerciale | Coût |
|---|---|---|---|---|
| **A. Offre payante d'entrée de gamme** (recommandée) | ✅ par l'API | ✅ par le proxy | ✅ | quelques dollars par mois (prix à vérifier) |
| B. Rester en gratuit, génération manuelle sur le site d'ElevenLabs, puis découpage du fichier sur les silences | ✅ | ❌ | ❌ (citation d'ElevenLabs obligatoire) | gratuit |

Pour l'option B : fournir au porteur un texte unique avec une pause nette entre les questions, puis découper. Ni `ffmpeg` ni `sox` ne sont installés : convertir avec `afconvert` (macOS), puis découper le WAV en Python.

## 5. Architecture cible proposée (hybride)

| Situation | Voix | Détail |
|---|---|---|
| Questions **fixes** de `src/lib/questions.js` (environ 33, environ 2 700 caractères) | Ingrid **pré-générée** | Fichiers statiques, par exemple `public/audio/questions/<id>-<hash du texte>.mp3`, modèle `eleven_multilingual_v2`. Script de génération dans le dépôt, régénération quand un texte change |
| Questions **adaptées au brief**, relances, texte libre | Ingrid **à la demande** | Nouvelle route TTS dans `serveur/llm-proxy` (Cloudflare Worker) ; clé en secret du Worker (`wrangler secret put`), **deuxième clé dédiée** ; modèle rapide `eleven_flash_v2_5` en lecture continue ; cache par empreinte du texte |
| Proxy absent, quota épuisé, hors ligne | Meilleure voix locale | PR #31 |

**Points d'attention :**
- **Confidentialité** : un texte tiré du brief peut contenir des données personnelles (métier, parcours) envoyées à ElevenLabs. Il faut une activation volontaire, une mention dans la notice (`src/content/organisme.js`) et une ligne dans l'analyse d'impact, comme pour le proxy IA actuel.
- **Les 8 questions avec `{poste}`** : soit l'audio dit « ce poste » pendant que l'écran affiche le métier, soit on génère 8 × 220 variantes (environ 120 000 caractères, offre payante). En génération à la demande, la question est générée avec le métier.
- **Coût** : le cache évite de régénérer une question déjà lue.
- `npm run test:site` **lit les questions à voix haute** sur les haut-parleurs : prévenir le porteur avant de le lancer en local.
- `voice.js` classe les voix `com.apple.speech.synthesis.voice.*` comme robotiques, y compris d'anciennes voix correctes. À revoir éventuellement.

## 6. Prochaines étapes

1. Le porteur choisit **A** ou **B**.
2. Si **A** :
   1. générer 2 ou 3 questions d'essai avec Ingrid et les faire valider à l'oreille (stabilité 0,5, similarité 0,8, débit naturel) ;
   2. générer les questions fixes et les intégrer en lecture prioritaire, avec repli sur PR #31 ;
   3. ajouter la route TTS au proxy, avec ses tests (`tests/proxy.test.mjs`) ;
   4. mettre à jour la notice et l'analyse d'impact.
3. Si **B** : produire le texte avec les pauses, récupérer le fichier du porteur, le découper et l'intégrer.
4. Fusionner PR #31 comme socle de repli quand la CI de `main` sera stable. Les tests instables sont traités par les issues #29, PR #32 et #34.

*Rappel : les fichiers d'écoute (page de comparaison, échantillons Piper et macOS) étaient dans des dossiers temporaires de session, non versionnés. Ils sont faciles à régénérer.*
