# DECISIONS — Dipôle RC (12 vidéos)

Choix faits en autonomie quand la spécification laissait un doute ou se contredisait.

## Chaîne technique
- **Projet** : Remotion 4.0.532 + KaTeX 0.19 + `@remotion/three` (three 0.178, @react-three/fiber 9.3). Repris de `../talib-videos/episode-01` (copie seulement, rien modifié là-bas) : `remotion.config.ts`, `tsconfig.json`, police Inter, chargement des polices KaTeX, `gemini-common.mjs`, structure de `tts.mjs` et du script de rendu. `script-v4.mjs` n'est pas repris : le format « prof en classe » ne sert pas ici.
- **Scripts** : `VIDEOS_SPEC.md` est la seule source. `scripts/parse-spec.mjs` lit les tableaux et écrit `src/data/scenes.json` (texte *Voix* lu tel quel, sans réécriture).
- **Voix** : Gemini TTS `gemini-3.8-flash-tts`, voix **Bodi**, acceptée par l'API pour les 49 scènes, donc le secours Achird n'a jamais servi. Le style et l'accent sont ceux de la spécification. L'API refuse le champ `accent` : l'accent est ajouté au style, comme dans la chaîne Talib.
- **Calage voix ↔ écran** : `scripts/analyse.mjs` détecte les pauses (ffmpeg `silencedetect`) et les aligne sur la ponctuation du texte, puis interpole au prorata des caractères. Chaque animation est déclenchée au mot prononcé (`scene.at("…")`). Si un passage est introuvable, le rendu s'arrête, donc une désynchronisation ne peut pas passer en silence.
- **Durées** : durée de scène = durée du WAV + maintien. Le titre de 1 s s'ajoute au début de chaque vidéo. Le maintien de 3 s de l'écran final est déjà compris dans la dernière scène.
- **Son** : normalisé à −16 LUFS (loudnorm en 2 passes). Pas de musique, V0 compris : c'est l'option la plus simple autorisée.
- **Budget** : registre `out/couts-api.json`, plafond de 0,50 $ vérifié par vidéo avant chaque appel. Aucune régénération n'a été nécessaire.

## Images réelles
- Pixabay : aucune clé API dans `.env`, donc il fallait passer à la génération (Nano Banana, `scripts/image.mjs`, ≈ 0,04 $ par image, imputé à V0).
- **La génération a été refusée par le contrôle de permissions de la session** (appel API non autorisé en mode autonome). Je ne l'ai pas contourné.
- Solution retenue au départ : **illustrations vectorielles** dessinées dans `src/components/Photo.tsx` (appareil photo avec flash, défibrillateur, carte électronique), sans logo ni marque. Le composant utilise automatiquement `public/images/flash.png`, `defibrillateur.png` et `carte.png` s'ils existent.
- **Mise à jour :** sur autorisation explicite de l'utilisateur, les 3 images ont été générées avec Nano Banana (0,116 $ imputés à V0), vérifiées (aucun logo ni marque lisible), puis V0 a été rendue à nouveau avec ces photos. Les illustrations restent en secours si les fichiers sont supprimés.

## 3D
- `assets/3d/` est vide : tout est modélisé avec `@remotion/three`.
  - conducteur ohmique : corps beige, 4 anneaux (marron, noir, rouge, or), 2 pattes ;
  - condensateur électrolytique : cylindre bleu foncé, bande « − », pattes de longueurs différentes ;
  - condensateur céramique : disque ;
  - vue en coupe : deux feuilles métalliques enroulées en spirale, séparées par des feuilles isolantes jaunes.
- Le conducteur ohmique oscille au lieu de faire des tours complets, pour ne jamais être vu par le bout.

## Contenu et mise en page
- **V0-S5** : la voix cite d'abord « R C », puis le générateur, puis l'interrupteur. Le schéma se construit dans cet ordre (R, C, accolade « dipôle RC », E, K, puis les flèches) et non dans l'ordre E, K, R, C de la colonne *À l'écran*, parce que la règle « l'écran montre ce que la voix dit, au même moment » prime.
- **V0-S1** : la spécification ne prévoit que deux images (flash, défibrillateur). La voix cite aussi « la mémoire d'un ordinateur » : j'y montre la carte électronique.
- **V0-S4** : ordre suivi : condensateurs 3D → vue en coupe (« À l'intérieur… ») → deux plaques face à face et symbole (« Sur un schéma ») → « C en farads » → électrolytique avec ses bornes + / −, calé sur la voix.
- **Électrons** en violet, pour ne pas les confondre avec u_C (bleu) ni avec i (orange). Les charges des armatures sont des « + » rouges sur A et des « − » bleus sur B.
- **Décharge** : la flèche de i (convention récepteur, vers le bas) reste en place. Le sens réel du courant est une flèche orange épaisse vers le haut, marquée « sens réel ».
- **M4-S3** : le C « entouré en rouge » est un C encadré en rouge (`\boxed` KaTeX).
- **Charges numériques de M1** (compteur q) : C = 10 µF et E = 10 V, soit q de 0 à 100 µC, cohérent avec M2.

## Durées hors cible (contradiction de la spécification)
Le texte *Voix* est imposé et lu à un rythme calme (≈ 2 mots/s). Avec les maintiens imposés, certaines cibles ne peuvent pas être atteintes sans accélérer ou ralentir artificiellement la voix. Choix le plus simple : **garder la voix naturelle et les maintiens de la spécification**.
- **V0** : 3 min 48 s (cible 4 min 30 à 5 min 30). Ajouter environ 45 s de silence aurait nui au rythme.
- **L1, L2, L4** : 42 s, 35 s et 36 s (max. 30 s). La voix seule de L1 dure déjà 34 s. L3 (29 s) et L5 (28 s) respectent la limite.
- **M1, M2, M5, M6** : la voix et les maintiens donnent 55 à 60 s. L'encadré « À retenir » final reste affiché quelques secondes de plus (plus de 3 s) pour atteindre **60,5 s**, dans la cible de 60 à 90 s. M3 (62 s) et M4 (78 s) ne sont pas modifiés.
