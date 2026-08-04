# E-commerce Project

## CI/CD

This repository includes a GitHub Actions workflow in [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml) that:

- runs on pushes and pull requests to the main/master branch
- installs dependencies for the root, frontend, and backend apps
- lints and builds the frontend
- builds Docker images for the backend and frontend
- deploys the stack with Docker Compose on the main/master branch when Docker Hub credentials are configured

## Required GitHub Secrets

Set these repository secrets before enabling deployment:

- DOCKER_HUB_USERNAME
- DOCKER_HUB_TOKEN

## Local Development

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..
docker compose up --build
```
