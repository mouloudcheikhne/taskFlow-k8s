<div align="center">

# TaskFlow · API & Kubernetes

**API REST de gestion de tâches** — backend **Node.js** (**Express**), persistance **MongoDB** (**Mongoose**), conteneur **Docker**, orchestration **Kubernetes**, CI **GitHub Actions**.

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=flat-square&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Minikube](https://img.shields.io/badge/Minikube-326CE5?style=flat-square&logo=kubernetes&logoColor=white)](https://minikube.sigs.k8s.io/)
[![kubectl](https://img.shields.io/badge/kubectl-326CE5?style=flat-square&logo=kubernetes&logoColor=white)](https://kubernetes.io/docs/reference/kubectl/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=flat-square&logo=swagger&logoColor=black)](https://swagger.io/)

</div>

---

## Sommaire

- [Vue d’ensemble](#vue-densemble)
- [Architecture](#architecture)
- [Stack technique & icônes des outils](#stack-technique--icônes-des-outils)
- [Structure du dépôt](#structure-du-dépôt)
- [Installation locale : Minikube (tests K8s)](#installation-locale--minikube-tests-k8s)
- [Déployer TaskFlow sur le cluster](#déployer-taskflow-sur-le-cluster)
- [Référence des commandes Kubernetes utiles](#référence-des-commandes-kubernetes-utiles)
- [CI/CD (GitHub Actions)](#cicd-github-actions)
- [Développement local (sans Kubernetes)](#développement-local-sans-kubernetes)

---

## Vue d’ensemble

| Couche | Rôle |
|--------|------|
| **Backend** | API HTTP pour les tâches : routes `/tasks` (CRUD + complétion), documentation **Swagger** sur `/api-docs`. |
| **Données** | Schémas et requêtes **Mongoose** vers **MongoDB** ; l’URI est fournie par la variable `DB_URL`. |
| **Conteneur** | Image **Node 22 Alpine**, port **3000**, construite depuis `backend/Dockerfile`. |
| **Cluster** | **Deployments** + **Services** + **ConfigMaps** pour MongoDB et l’API ; le backend atteint la base via le DNS interne `db-service`. |
| **CI** | Push sur `main` → build & push de l’image Docker vers Docker Hub (`.github/workflows/ci-cd.yml`). |

---

## Architecture

Flux principal une fois les manifestes appliqués :

```mermaid
flowchart TB
  subgraph clients[Clients]
    Browser[Navigateur / curl / Postman]
  end

  subgraph cluster[Cluster Kubernetes]
    subgraph backend_layer[Backend]
      SVC_B[Service backend-service\nNodePort 80→3000]
      DEP_B[Deployment backend-deployment\n2 replicas]
    end
    subgraph db_layer[Base de données]
      SVC_DB[Service db-service\nClusterIP :27017]
      DEP_DB[Deployment db-deployment\nMongoDB 6]
    end
    CM_B[ConfigMap backend-config\nDB_URL, PORT]
    CM_DB[ConfigMap db-configmap\nutilisateur Mongo init]
  end

  Browser -->|HTTP| SVC_B
  SVC_B --> DEP_B
  CM_B -.->|env| DEP_B
  DEP_B -->|mongoose → DB_URL| SVC_DB
  SVC_DB --> DEP_DB
  CM_DB -.->|env| DEP_DB
```

**Réseau :**

- **`db-service`** (ClusterIP) expose MongoDB sur le port **27017** uniquement *à l’intérieur* du cluster. Le backend utilise une URI du type `mongodb://user:pass@db-service:27017/...`.
- **`backend-service`** (NodePort) rend l’API accessible depuis l’hôte via un port du nœud (sous Minikube, utiliser `minikube service` pour l’URL exacte).

**Sécurité :** les identifiants MongoDB figurent dans des ConfigMaps (clair). Pour un environnement réel, préférez des **Secrets** Kubernetes et des solutions de gestion de secrets.

---

## Stack technique & icônes des outils

| Outil | Rôle dans ce projet |
|-------|---------------------|
| ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat&logo=nodedotjs&logoColor=white) | Runtime JavaScript (ES modules). |
| ![Express](https://img.shields.io/badge/-Express-000000?style=flat&logo=express&logoColor=white) | Framework HTTP, routes `/tasks`, middlewares d’erreur. |
| ![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?style=flat&logo=mongodb&logoColor=white) | Base NoSQL ; image officielle `mongo:6` côté cluster. |
| ![Mongoose](https://img.shields.io/badge/-Mongoose-880000?style=flat&logo=mongoose&logoColor=white) | ODM, connexion via `DB_URL`. |
| ![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat&logo=docker&logoColor=white) | Image de l’API ; build dans le workflow GitHub Actions. |
| ![Kubernetes](https://img.shields.io/badge/-Kubernetes-326CE5?style=flat&logo=kubernetes&logoColor=white) | Orchestration : Deployments, Services, ConfigMaps. |
| ![Minikube](https://img.shields.io/badge/-Minikube-326CE5?style=flat&logo=kubernetes&logoColor=white) | Cluster local pour reproduire le déploiement. |
| ![Swagger](https://img.shields.io/badge/-Swagger-85EA2D?style=flat&logo=swagger&logoColor=black) | OpenAPI : `/api-docs` et `/api-docs.json`. |

---

## Structure du dépôt

```
taskFlow-k8s/
├── .github/workflows/ci-cd.yml    # Build + push Docker Hub sur push main
├── backend/
│   ├── Dockerfile                 # Node 22 Alpine, PORT 3000
│   ├── package.json
│   ├── servcer.js                 # Point d’entrée Express (Swagger, /tasks)
│   └── src/
│       ├── config/                # dbConfig.js, swagger.js
│       ├── controller/            # task.controller.js
│       ├── service/               # task.service.js
│       ├── routes/                # task.route.js
│       ├── model/                 # task.js
│       └── exeception/            # custumException.js
└── k8s/
    ├── backend/
    │   ├── backend-configMap.yaml # DB_URL, PORT → backend-config
    │   ├── backend-deployment.yaml
    │   └── backend-service.yaml   # NodePort → API
    └── db/
        ├── db-configmap.yaml      # MONGO_INITDB_* → db-configmap
        ├── db-deployment.yaml
        └── db-service.yaml        # ClusterIP MongoDB
```

---

## Installation locale : Minikube (tests K8s)

### Prérequis

- **kubectl** — [Installation](https://kubernetes.io/docs/tasks/tools/#kubectl)  
- **Docker** (ou autre driver supporté) — pour le moteur de conteneurs de Minikube  
- **Minikube** — cluster Kubernetes léger sur la machine

### Fedora / Linux (méthode binaire recommandée par la doc Minikube)

```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
minikube version
```

*(Sur **ARM64**, remplacez `minikube-linux-amd64` par `minikube-linux-arm64` dans l’URL et le fichier téléchargé.)*

### Démarrer le cluster

```bash
minikube start
kubectl cluster-info
kubectl get nodes
```

Optionnel : `minikube dashboard` ouvre l’UI web du cluster.

### Docker Hub et image backend

Le **Deployment** référence une image publique (ex. `mouloudissilayine/taskflowapp:1.0`). Pour utiliser **votre** image :

1. Construisez et poussez depuis `backend/` (ou laissez **GitHub Actions** pousser sur `main` avec les secrets `DOCKER_USERNAME` / `DOCKER_PASSWORD`).
2. Dans `k8s/backend/backend-deployment.yaml`, alignez le champ `image:` sur le tag réel (`:latest`, `:1.0`, etc.).

Les clusters locaux **ne tirent pas** automatiquement depuis votre machine : soit une image sur un registre (Docker Hub, etc.), soit `eval $(minikube docker-env)` puis `docker build` dans l’environnement Minikube (voir [doc Minikube](https://minikube.sigs.k8s.io/docs/handbook/pushing/)).

---

## Déployer TaskFlow sur le cluster

Appliquer dans l’ordre **ConfigMaps** puis **Deployments** et **Services** (ou tout un dossier : `kubectl` accepte plusieurs fichiers).

```bash
# Depuis la racine du dépôt
kubectl apply -f k8s/db/db-configmap.yaml
kubectl apply -f k8s/db/db-deployment.yaml
kubectl apply -f k8s/db/db-service.yaml

kubectl apply -f k8s/backend/backend-configMap.yaml
kubectl apply -f k8s/backend/backend-deployment.yaml
kubectl apply -f k8s/backend/backend-service.yaml
```

Raccourci équivalent si tous les YAML sont présents :

```bash
kubectl apply -f k8s/db/
kubectl apply -f k8s/backend/
```

**Accéder à l’API (NodePort sous Minikube) :**

```bash
minikube service backend-service --url
```

Ouvrez l’URL affichée (racine `/`, tâches `/tasks`, doc `/api-docs`).

---

## Référence des commandes Kubernetes utiles

| Action | Commande |
|--------|----------|
| Voir les pods | `kubectl get pods -o wide` |
| Voir les services | `kubectl get svc` |
| Voir les déploiements | `kubectl get deployments` |
| Logs d’un pod backend | `kubectl logs -l app=backend --tail=100 -f` |
| Logs MongoDB | `kubectl logs -l app=db --tail=100` |
| Décrire un pod (événements, erreurs image) | `kubectl describe pod <nom-du-pod>` |
| Shell dans un conteneur | `kubectl exec -it <nom-du-pod> -- sh` |
| Redémarrer un déploiement (rollout) | `kubectl rollout restart deployment/backend-deployment` |
| Supprimer les ressources du projet | `kubectl delete -f k8s/backend/ -f k8s/db/` |
| Namespace (si vous en utilisez un) | `kubectl apply -f ... -n taskflow` puis `-n taskflow` sur les autres commandes |

**Fichiers de manifeste :** `kubectl apply -f fichier.yaml` crée ou met à jour ; `kubectl delete -f fichier.yaml` supprime la ressource décrite.

---

## CI/CD (GitHub Actions)

Le workflow [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml) sur branche **`main`** :

1. Checkout du code  
2. Connexion à **Docker Hub** (`DOCKER_USERNAME`, `DOCKER_PASSWORD`)  
3. `docker build` puis `docker push` avec le tag `taskflowapp:latest`

Configurez les **secrets** du dépôt GitHub pour que le push fonctionne. Adaptez le tag dans le Deployment K8s si vous ne déployez pas `latest`.

---

## Développement local (sans Kubernetes)

```bash
cd backend
npm install
```

Créez `backend/.env` avec une URI MongoDB locale, par exemple :

```env
DB_URL=mongodb://localhost:27017/taskFlow
PORT=3000
```

Démarrez MongoDB sur la machine (service `mongod`, Docker, etc.), puis :

```bash
npm start
```

L’API écoute sur le port **3000** (`servcer.js`). Documentation interactive : **http://localhost:3000/api-docs**.

**Image Docker en local :**

```bash
cd backend
docker build -t taskflow-backend:local .
docker run --rm -p 3000:3000 -e DB_URL="mongodb://host.docker.internal:27017/taskFlow" taskflow-backend:local
```

*(Sous Linux, `host.docker.internal` peut nécessiter `--add-host=host.docker.internal:host-gateway` selon la version de Docker.)*

---

## Licence

Voir le champ `license` dans `backend/package.json` (ISC par défaut).
