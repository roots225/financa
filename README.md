# Financa

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Déploiement & Docker

### 1. Lancement local avec Docker Compose

Pour construire et démarrer l'application Angular SSR dans un conteneur Docker optimisé :

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Construire et démarrer le conteneur
docker compose up -d --build

# Consulter les logs
docker compose logs -f financa

# Vérifier la santé du conteneur
curl http://localhost:4000/health
```

L'application est accessible sur [http://localhost:4000](http://localhost:4000).

### 2. Déploiement automatique sur VPS (GitHub Actions)

Le workflow `.github/workflows/deploy.yml` est préconfiguré pour :
1. Tester et valider le build Angular SSR (`bun run test` & `bun run build`).
2. Compiler et publier l'image Docker sur **GitHub Container Registry (GHCR)** (`ghcr.io/<owner>/financa:latest`).
3. Se connecter en SSH à votre VPS, télécharger l'image et redémarrer le conteneur sans interruption.

#### Configuration des secrets GitHub Actions :
Dans votre dépôt GitHub, allez dans **Settings > Secrets and variables > Actions**, puis ajoutez :

| Secret | Description | Exemple |
|---|---|---|
| `VPS_HOST` | Adresse IP ou domaine de votre VPS | `194.163.150.22` |
| `VPS_USER` | Utilisateur SSH avec droits docker | `root` ou `ubuntu` |
| `VPS_SSH_KEY` | Clé privée SSH (format OpenSSH) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `VPS_PORT` *(optionnel)* | Port SSH du VPS | `22` |
| `VPS_DEPLOY_PATH` *(optionnel)* | Dossier sur le VPS | `/opt/financa` |

### 3. Reverse Proxy Nginx & HTTPS sur le VPS

Un fichier modèle est fourni dans [`deploy/nginx/financa.conf`](file:///Users/gillesyao/Documents/projects/centrafin/financa/deploy/nginx/financa.conf). Pour l'activer sur le VPS :

```bash
# Copier la configuration Nginx
sudo cp deploy/nginx/financa.conf /etc/nginx/sites-available/financa

# Activer le site et recharger Nginx
sudo ln -s /etc/nginx/sites-available/financa /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Activer le certificat SSL gratuit Let's Encrypt
sudo certbot --nginx -d votredomaine.com
```

