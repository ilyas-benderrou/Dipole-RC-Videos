# RC-Lab – Vidéos pédagogiques (Dipôle RC)

Douze vidéos animées en français pour la plateforme [RC-Lab](../Dipole-RC-App), sur la charge et la décharge du condensateur (leçon *Dipôle RC*, 2ème année du baccalauréat PC/SM). Projet réalisé dans le cadre du master « Système éducatif intelligent et communicant » (ENS Fès).

| Vidéo | Contenu |
|---|---|
| V0 | Introduction à la charge et à la décharge |
| L1 à L5 | Cinq leçons animées courtes (~30 s) |
| M1 à M6 | Six micro-vidéos de remédiation, une par erreur fréquente des apprenants |

## Technique

- [Remotion](https://www.remotion.dev) (React) pour l'animation, 1920 × 1080, 30 images/s, MP4 H.264.
- Formules affichées avec KaTeX, scènes 3D avec React Three Fiber.
- Voix off générée avec Gemini TTS, synchronisée scène par scène avec l'écran.

## Lancer le projet

Prérequis : Node.js 20 ou plus récent, et une clé API Gemini dans un fichier `.env` (non publié).

```bash
npm install
npm run studio   # aperçu dans Remotion Studio
npm run tts      # génération des voix
npm run video    # rendu des vidéos dans out/
```

Les vidéos rendues (`out/`) ne sont pas incluses dans le dépôt.

## Auteur

Ilyas Benderrou – [github.com/ilyas-benderrou](https://github.com/ilyas-benderrou)
