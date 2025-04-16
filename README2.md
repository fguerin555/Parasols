# Guide de Déploiement Parasols

## Structure du Projet

```
parasols/
├── config/
│   ├── package.github.json
│   └── package.vercel.json
├── src/
├── public/
└── ...
```

## Instructions de Déploiement

### GitHub Pages

```bash
# Copier la configuration GitHub Pages
cp config/package.github.json package.json

# Installer les dépendances si nécessaire
npm install

# Déployer sur GitHub Pages
npm run deploy
```

### Vercel

```bash
# Copier la configuration Vercel
cp config/package.vercel.json package.json

# Installer les dépendances si nécessaire
npm install

# Déployer sur Vercel
vercel --prod
```

## Notes Importantes

- Gardez toujours une copie des deux fichiers de configuration dans le dossier `/config`
- Ne modifiez pas directement `package.json`
- Utilisez uniquement les commandes ci-dessus pour déployer
- Après chaque déploiement, vérifiez que l'application fonctionne correctement

## URLs de Production

- GitHub Pages : https://fguerin555.github.io/Parasols
- Vercel : https://parasols.vercel.app
