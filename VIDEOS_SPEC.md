# VIDEOS_SPEC — Dipôle RC (projet SEI, Master SIEC)

Tu es Claude Code. Ce fichier décrit les 12 vidéos à produire pour la plateforme éducative sur la charge et la décharge du condensateur (leçon *Dipôle RC*, 2ème Bac PC/SM). Lis-le en entier avant de commencer.

## 1. Ordre de travail (obligatoire)

1. **Mise en place** : crée un projet Remotion dans ce dossier en réutilisant la chaîne déjà validée de `../talib-videos/episode-01` (copie `scripts/tts.mjs`, `scripts/gemini-common.mjs`, `scripts/script-v4.mjs` si utile, `remotion.config.ts`, les polices et la logique KaTeX). **Ne modifie rien dans `../talib-videos`.** Adapte les copies : accent français, pas d'identité Talib 4.0.
2. **V0**, puis **L1 à L5**, puis **M1 à M6**.

Pas de test préalable : produis directement les vidéos finales.

**Travaille en autonomie complète : ne me pose aucune question et ne t'arrête pas pour une validation entre les étapes.** Vérifie chaque vidéo toi-même (rendu sans erreur, voix synchronisée avec l'écran, durée respectée) et corrige avant de passer à la suivante.

À la fin seulement : un résumé court, la liste des fichiers dans `out/`, le coût total TTS, et rappelle-moi d'arrêter Remotion Studio.

Si une chose n'est pas claire, choisis la solution la plus simple, note-la dans `DECISIONS.md` et continue.

## 2. Règles techniques

| Élément | Règle |
| --- | --- |
| Format | 1920 × 1080, 30 i/s, MP4 H.264, un fichier par vidéo : `out/V0.mp4`, `out/L1.mp4` … `out/M6.mp4` |
| Voix | Gemini TTS, voix **Bodi** (secours : Achird), **français uniquement** (aucune darija) |
| Style de voix (TTS) | « Read in French like a physics teacher explaining to his high-school students: clear, calm and warm, natural rhythm, short pause after each formula. » |
| Accent (TTS) | « Français standard, diction claire et posée » |
| Pistes audio | **Une piste par scène** (une ligne de tableau = une scène = un fichier WAV) |
| Durée d'une scène | durée de la voix + le « maintien » indiqué ; l'animation se cale sur la voix |
| Texte à l'écran | En français ; formules en LaTeX (KaTeX). L'écran montre ce que la voix dit, au même moment |
| Texte lu par la voix | La colonne *Voix* est **déjà écrite pour la synthèse vocale** (symboles épelés : « u c », « dé q sur dé t », « tau »). La lire telle quelle, ne pas la réécrire |
| Vocabulaire | « conducteur ohmique » (composant), « résistance R » (grandeur) ; grandeurs variables en minuscules |
| Couleurs | u_C et ses courbes en bleu ; i en orange ; repères (0,63E, 0,37E, τ, tangente) en gris pointillé ; fond clair |
| Animations | Simples et lisibles : tracés progressifs, formules qui s'écrivent, flèches qui bougent. Pas d'effets décoratifs |
| Musique | Aucune, ou une nappe très discrète sous V0 seulement |
| Habillage | Pas d'intro ni de fin de chaîne, pas d'appel à s'abonner. Titre de la vidéo en début, 1 s |
| Budget | 0,50 $ maximum par vidéo ; utilise le registre de coûts de `gemini-common.mjs`. Ne dépasse jamais ce plafond : si une régénération le ferait dépasser, garde la version existante, note-le dans `DECISIONS.md` et continue |
| Images réelles | Pixabay d'abord ; sinon génération (Nano Banana). Aucun logo ni marque visible |
| 3D | Si `assets/3d/` contient des rendus Blender, utilise-les. Sinon, modélise avec `@remotion/three` : conducteur ohmique (corps beige, 4 anneaux de couleur, 2 pattes) ; condensateur électrolytique (cylindre bleu foncé, bande « − », 2 pattes de longueurs différentes) ; condensateur céramique (disque) ; vue en coupe (deux feuilles métalliques enroulées séparées par une feuille isolante) |

### Le schéma commun (toutes les vidéos)
Générateur E à gauche (cercle, flèche E vers le haut) ; interrupteur K en haut avec les positions (1) à gauche (relie le générateur) et (2) à droite (relie une branche qui contourne le générateur) ; au centre, de haut en bas : conducteur ohmique R puis condensateur C ; flèches en convention récepteur : i vers le bas, u_R et u_C vers le haut. Armature A en haut du condensateur, B en bas.

## 3. Scripts

Colonnes : **Scène** (identifiant du fichier audio) · **Maintien** (secondes ajoutées après la voix) · **À l'écran** · **Voix** (texte exact pour le TTS).

### V0 — Introduction : charge et décharge d'un condensateur (cible 4 min 30 à 5 min 30)

| Scène | Maintien | À l'écran | Voix |
| --- | --- | --- | --- |
| V0-S1 | 2 s | Images réelles : flash d'appareil photo qui se déclenche, puis un défibrillateur. | Le flash d'un appareil photo, un défibrillateur, la mémoire d'un ordinateur… Tous ont besoin d'un composant qui stocke l'énergie électrique et la libère au bon moment : le condensateur. Voyons comment il se charge, et comment il se décharge. |
| V0-S2 | 2 s | Titre : « Le dipôle RC — charge et décharge d'un condensateur ». | Commençons par les deux composants du circuit. |
| V0-S3 | 8 s | Conducteur ohmique 3D qui tourne lentement ; photo réelle sur une carte électronique ; symbole (rectangle) avec i et u_R en convention récepteur ; `u_R = R \cdot i` s'écrit. | Voici un conducteur ohmique, tel qu'on le trouve sur les cartes électroniques. C'est un dipôle : il a deux bornes. Il est caractérisé par sa résistance R, en ohms ; ses anneaux de couleur indiquent sa valeur. Sur un schéma, on le dessine par un rectangle. En convention récepteur, la loi d'Ohm s'écrit : u R égale R fois i. Attention : on dit conducteur ohmique pour le composant, et résistance pour sa grandeur. |
| V0-S4 | 10 s | Condensateurs 3D (électrolytique et céramique) ; vue en coupe : armatures enroulées et diélectrique ; simplification en deux plaques face à face ; symbole (deux traits parallèles) ; « C en farads (F) — µF, nF ». | Et voici un condensateur. À l'intérieur, deux armatures conductrices sont séparées par un isolant, le diélectrique. Pour gagner de la place, elles sont souvent enroulées. Sur un schéma, on le dessine par deux traits parallèles. Point essentiel : aucune charge ne traverse l'isolant. Le condensateur est caractérisé par sa capacité C, en farads ; en pratique, on utilise des microfarads ou des nanofarads. Le condensateur électrolytique a une borne plus et une borne moins : il faut respecter son sens de branchement. |
| V0-S5 | 3 s | Le schéma commun se construit élément par élément : E, K (1)(2), R, C, puis les flèches. | Associons-les en série : c'est le dipôle R C. On le branche sur un générateur de tension E, avec un interrupteur K à deux positions. |
| V0-S6 | 6 s | K bascule sur (1). Les électrons quittent A, font le tour et s'accumulent sur B sans traverser le diélectrique ; « + » sur A, « − » sur B. À droite, u_C(t) se trace de 0 vers E, puis i(t) de E/R vers 0. | K en position un : la tension passe brusquement de zéro à E. C'est un échelon de tension montant. Les électrons quittent l'armature A, font le tour du circuit et s'accumulent sur l'armature B. A devient positive, B négative : le condensateur se charge. Au début, le courant est maximal, et u c est nulle. Puis u c monte de moins en moins vite vers E, et le courant diminue jusqu'à zéro. |
| V0-S7 | 6 s | K bascule sur (2) ; le générateur passe en gris. Les électrons de B reviennent vers A par le conducteur ohmique ; la flèche du courant réel s'inverse. u_C(t) descend de E vers 0 ; i(t) part de −E/R sous l'axe et remonte vers 0. | K en position deux : le générateur est retiré, mais le condensateur, lui, est chargé. Les électrons de B reviennent vers A à travers le conducteur ohmique : c'est la décharge. Le courant circule en sens inverse : il est donc négatif. Et u c diminue de E vers zéro, vite au début, puis de plus en plus lentement. |
| V0-S8 | 4 s | Deux courbes de charge superposées : C et 2C (plus lente) ; `\tau = RC` apparaît. | La vitesse de la charge et de la décharge dépend d'une seule grandeur : la constante de temps tau, égale à R fois C. Plus tau est grande, plus le condensateur est lent. |
| V0-S9 | 4 s | Trois cartes : « K en 1 : charge, u_C → E » ; « K en 2 : décharge, u_C → 0 » ; « τ = RC fixe la vitesse ». Puis les vignettes L1 à L5. | Retenons : en position un, le condensateur se charge et u c monte vers E. En position deux, il se décharge et u c descend vers zéro. Dans les leçons suivantes, on met tout cela en équations. |

### L1 à L5 — Leçons animées (30 s maximum chacune)
Un seul écran-résumé qui se construit ; l'écran final reste 3 s (inclus dans le maintien de la dernière scène).

#### L1 — Le condensateur (C1)
| Scène | Maintien | À l'écran | Voix |
| --- | --- | --- | --- |
| L1-S1 | 1 s | Deux armatures ; les électrons quittent A, font le tour, s'arrêtent sur B devant le diélectrique ; « + » sur A, « − » sur B. | Un condensateur, c'est deux armatures séparées par un isolant. Pendant la charge, les électrons quittent A et s'accumulent sur B, sans traverser l'isolant. |
| L1-S2 | 1 s | `q = q_A = -q_B` ; `q = C \cdot u_C` ; `i = \dfrac{dq}{dt}` s'écrivent l'une sous l'autre. | La charge q est proportionnelle à la tension : q égale C fois u c. Et le courant est le débit de charge : i égale dé q sur dé t. |
| L1-S3 | 3 s | Série : `\dfrac{1}{C_e} = \dfrac{1}{C_1} + \dfrac{1}{C_2}` ; parallèle : `C_e = C_1 + C_2`. | En série, on additionne les inverses des capacités. En parallèle, on additionne les capacités. |

#### L2 — La charge (C2, C3)
| Scène | Maintien | À l'écran | Voix |
| --- | --- | --- | --- |
| L2-S1 | 1 s | Schéma commun ; K bascule sur (1) ; la flèche de i s'allume. | K en position un : le condensateur se charge à travers le conducteur ohmique. |
| L2-S2 | 1 s | `u_R + u_C = E` devient `RC\,\dfrac{du_C}{dt} + u_C = E`. | La loi d'additivité des tensions donne l'équation : R C, dé u c sur dé t, plus u c, égale E. |
| L2-S3 | 3 s | `u_C = E\left(1 - e^{-t/\tau}\right)` ; la courbe monte vers E ; puis `i = \dfrac{E}{R}e^{-t/\tau}` et sa courbe descend vers 0. | Solution : u c égale E fois, un moins exponentielle de moins t sur tau. La tension monte vers E, et le courant tombe à zéro. |

#### L3 — La constante de temps τ (C4)
| Scène | Maintien | À l'écran | Voix |
| --- | --- | --- | --- |
| L3-S1 | 1 s | `\tau = RC` puis `[\tau] = \text{s}`. | Tau égale R fois C. C'est un temps, en secondes. |
| L3-S2 | 1 s | Courbe de charge : le point 0,63E s'allume et descend sur l'axe en τ ; la tangente à l'origine se trace jusqu'à l'asymptote E, au-dessus de τ. | Sur la courbe de charge, on lit tau quand u c atteint soixante-trois pour cent de E, ou là où la tangente à l'origine coupe l'asymptote. |
| L3-S3 | 3 s | Deux courbes : C et 2C ; le repère 5τ s'affiche. | Si R ou C double, tau double. Et la charge n'est terminée qu'après cinq tau. |

#### L4 — La décharge (C2, C3, C5)
| Scène | Maintien | À l'écran | Voix |
| --- | --- | --- | --- |
| L4-S1 | 1 s | K bascule sur (2) ; le générateur passe en gris. | K en position deux : le condensateur se décharge dans le conducteur ohmique. |
| L4-S2 | 1 s | `RC\,\dfrac{du_C}{dt} + u_C = 0` puis `u_C = E\,e^{-t/\tau}` ; la courbe descend ; le point 0,37E s'allume en τ. | L'équation devient : R C, dé u c sur dé t, plus u c, égale zéro. Donc u c égale E, exponentielle de moins t sur tau. À tau, il reste trente-sept pour cent de E. |
| L4-S3 | 3 s | La flèche du courant réel se retourne ; `i = -\dfrac{E}{R}e^{-t/\tau}` ; la courbe de i sous l'axe. | Le courant change de sens : i est négatif. Et u c, elle, ne saute jamais. |

#### L5 — L'énergie emmagasinée (C6)
| Scène | Maintien | À l'écran | Voix |
| --- | --- | --- | --- |
| L5-S1 | 2 s | Le condensateur chargé relié à un petit moteur qui soulève une masse m. | Un condensateur chargé stocke de l'énergie : relié à un moteur, il soulève une masse. |
| L5-S2 | 1 s | `E_e = \tfrac{1}{2}\,C\,u_C^2` avec les unités J, F, V. | Cette énergie vaut un demi de C, fois u c au carré, en joules. |
| L5-S3 | 3 s | `u_C = E \Rightarrow E_e = \tfrac{1}{2}\,C\,E^2`. | En fin de charge, elle est maximale : un demi de C, E au carré. |

### M1 à M6 — Micro-vidéos de remédiation (60 à 90 s)
Même plan pour toutes : l'erreur (réponse de l'apprenant barrée en rouge), pourquoi c'est faux, la bonne idée, puis un encadré « À retenir » qui reste 3 s.

#### M1 — « Le courant traverse le condensateur » (erreur E1)
| Scène | Maintien | À l'écran | Voix |
| --- | --- | --- | --- |
| M1-S1 | 1 s | Réponse barrée : « les électrons traversent le condensateur ». | Tu as répondu que le courant traverse le condensateur. C'est une erreur très fréquente, même chez les étudiants. |
| M1-S2 | 2 s | Zoom sur la vue en coupe : diélectrique en jaune ; un électron s'approche, rebondit et reste sur l'armature B. | Regarde l'intérieur : entre les deux armatures, il y a un isolant, le diélectrique. Les charges ne peuvent pas le traverser. Les électrons qui arrivent sur l'armature B s'y accumulent ; ils ne passent jamais de l'autre côté. |
| M1-S3 | 2 s | Circuit entier : les électrons quittent A, passent par le générateur et le conducteur ohmique, arrivent sur B ; un compteur montre q qui augmente. | Alors, d'où vient le courant ? Pendant la charge, des électrons quittent A, font le tour du circuit et arrivent sur B. Le courant circule dans les fils, de part et d'autre du condensateur, mais pas à travers lui. |
| M1-S4 | 3 s | Le circuit s'immobilise ; `i = 0`. Encadré : « Le courant circule dans le circuit, jamais à travers l'isolant. » | C'est pour ça qu'une fois le condensateur chargé, le courant s'arrête. Retiens : le courant circule dans le circuit, jamais à travers l'isolant. |

#### M2 — « La capacité dépend de la tension » (erreur E2)
| Scène | Maintien | À l'écran | Voix |
| --- | --- | --- | --- |
| M2-S1 | 1 s | Réponse barrée : « si U augmente, C augmente ». | Tu as pensé que la capacité change quand la tension change. Voyons pourquoi ce n'est pas le cas. |
| M2-S2 | 2 s | Tableau : C = 10 µF ; u = 5 V → q = 50 µC ; u = 10 V → q = 100 µC ; le rapport q/u = 10 µF s'allume deux fois. | Prenons un condensateur de dix microfarads. Sous cinq volts, il porte cinquante microcoulombs. Sous dix volts, il porte cent microcoulombs. Quand la tension double, c'est la charge qui double ; le rapport q sur u, lui, reste égal à dix microfarads. |
| M2-S3 | 2 s | Condensateur 3D en coupe ; trois étiquettes : surface des armatures, distance entre elles, nature de l'isolant. | La capacité est une caractéristique du condensateur, comme la résistance R pour un conducteur ohmique. Elle dépend de sa fabrication : la surface des armatures, la distance entre elles et la nature de l'isolant. |
| M2-S4 | 3 s | Encadré : « `C = q / u_C` est constante : si u_C change, c'est q qui change. » | Retiens : C est constante. Si la tension change, c'est la charge qui change, pas la capacité. |

#### M3 — « Le début et la fin de la charge » (erreur E3)
| Scène | Maintien | À l'écran | Voix |
| --- | --- | --- | --- |
| M3-S1 | 1 s | Réponse barrée : « à t = 0, u_C = E ». | Tu t'es trompé sur le tout début ou la fin de la charge. Regardons les deux instants clés. |
| M3-S2 | 2 s | Schéma à t = 0 : condensateur vide, `u_C = 0`, `u_R = E`, `i = E/R` ; le départ des deux courbes s'allume. | Au moment où on ferme K, le condensateur est vide : u c vaut zéro. Il faut du temps pour déplacer des charges, donc u c ne peut pas sauter d'un coup. Toute la tension E se retrouve aux bornes du conducteur ohmique : le courant est maximal, égal à E sur R. |
| M3-S3 | 2 s | Schéma après 5τ : `u_C = E`, `u_R = 0`, `i = 0` ; la fin des courbes s'allume. | À la fin de la charge, u c a rejoint E. Il ne reste plus de tension aux bornes du conducteur ohmique, donc le courant est nul. Le condensateur se comporte alors comme un interrupteur ouvert. |
| M3-S4 | 3 s | Tableau : début (u_C = 0 ; i = E/R) et fin (u_C = E ; i = 0). | Retiens : u c ne saute jamais, le courant peut sauter. Au début, u c est nulle et le courant est maximal. À la fin, u c vaut E et le courant est nul. |

#### M4 — « Mon équation différentielle est fausse » (erreur E4)
| Scène | Maintien | À l'écran | Voix |
| --- | --- | --- | --- |
| M4-S1 | 1 s | Réponse barrée : « `u_R = R\,\dfrac{du_C}{dt}` ». | Ton équation différentielle est fausse. Voici une méthode en trois étapes qui marche à chaque fois. |
| M4-S2 | 2 s | Étape 1, deux schémas : charge `u_R + u_C = E` ; décharge (générateur en gris) `u_R + u_C = 0`. | Étape un : la loi d'additivité des tensions. Pendant la charge, u R plus u c égale E. Pendant la décharge, le générateur est retiré : u R plus u c égale zéro. |
| M4-S3 | 2 s | Étape 2 : `u_R = R\,i`, puis `i = C\,\dfrac{du_C}{dt}` avec le C entouré en rouge ; résultat `u_R = RC\,\dfrac{du_C}{dt}`. | Étape deux : exprimer u R. La loi d'Ohm donne u R égale R fois i. Et pour le condensateur, i égale C fois dé u c sur dé t. N'oublie pas le C ! Donc u R égale R C, dé u c sur dé t. |
| M4-S4 | 2 s | Étape 3 : `RC\,\dfrac{du_C}{dt} + u_C = E` (charge) et `= 0` (décharge). | Étape trois : on remplace. En charge : R C, dé u c sur dé t, plus u c, égale E. En décharge : la même chose, égale zéro. |
| M4-S5 | 3 s | Encadré : charge `u_C(0) = 0` ; décharge `u_C(0) = E`. | Pour trouver les constantes, utilise la condition initiale : en charge, le condensateur part vide ; en décharge, il part chargé à E. |

#### M5 — « Je lis τ au mauvais endroit » (erreur E5)
| Scène | Maintien | À l'écran | Voix |
| --- | --- | --- | --- |
| M5-S1 | 1 s | Réponse barrée : en charge, τ lu à 0,37E. | Tu as lu tau au mauvais endroit. Voici comment ne plus confondre soixante-trois et trente-sept pour cent. |
| M5-S2 | 2 s | Courbe de charge : `u_C(\tau) = E(1 - e^{-1}) \approx 0{,}63E` ; le point s'allume. | En charge, remplace t par tau : u c égale E fois, un moins exponentielle de moins un, soit zéro virgule soixante-trois E. La tension monte : à tau, elle a atteint soixante-trois pour cent de E. |
| M5-S3 | 2 s | Courbe de décharge : `u_C(\tau) = E\,e^{-1} \approx 0{,}37E` ; une barre montre 63 % perdus, 37 % restants. | En décharge, u c égale E fois exponentielle de moins un, soit zéro virgule trente-sept E. La tension descend : à tau, elle a perdu soixante-trois pour cent, il en reste trente-sept. |
| M5-S4 | 3 s | Encadré : « À t = τ, 63 % du changement est fait. » ; le repère 5τ sur la courbe de charge. | Retiens : à tau, le condensateur a toujours fait soixante-trois pour cent du chemin. Et à tau, ce n'est pas fini : il faut environ cinq tau. |

#### M6 — « J'ai oublié le signe du courant » (erreur E6)
| Scène | Maintien | À l'écran | Voix |
| --- | --- | --- | --- |
| M6-S1 | 1 s | Réponse barrée : en décharge, `i = +\dfrac{E}{R}e^{-t/\tau}`. | Pendant la décharge, ton courant a le mauvais signe. Voyons pourquoi il doit être négatif. |
| M6-S2 | 2 s | Schéma de décharge avec la même flèche de i que pendant la charge ; les électrons repartent dans l'autre sens ; le sens réel du courant en orange, opposé à la flèche. | On garde la même orientation du circuit que pendant la charge. Or, pendant la décharge, les charges repartent dans l'autre sens : le courant réel est opposé à la flèche. Donc i est négatif. |
| M6-S3 | 2 s | `i = C\,\dfrac{du_C}{dt}` ; « u_C diminue donc `\dfrac{du_C}{dt} < 0` » ; `i = -\dfrac{E}{R}e^{-t/\tau}`. | Le calcul le confirme : i égale C fois dé u c sur dé t. Comme u c diminue, sa dérivée est négative. On obtient : i égale moins E sur R, exponentielle de moins t sur tau. |
| M6-S4 | 3 s | Courbe de i sous l'axe, de −E/R vers 0. Encadré : « En décharge, i < 0. » | Retiens : en décharge, i est négatif. Le signe moins veut dire que le courant circule dans le sens inverse de la charge. |
