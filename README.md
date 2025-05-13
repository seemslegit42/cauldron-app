# <Cauldron™>

This project is based on [OpenSaas](https://opensaas.sh) template and consists of three main dirs:
1. `app` - Cauldron™ web app, built with [Wasp](https://wasp.sh).
2. `e2e-tests` - [Playwright](https://playwright.dev/) tests for your Wasp web app.
3. `documentation` - Your blog / docs, built with [Astro](https://docs.astro.build) based on [Starlight](https://starlight.astro.build/) template.
4. `context-docs` - Contextual documentation for AI Coding agents explaining Cauldron's features

For more details, check READMEs of each respective directory!

## Git Setup

This repository uses Git for version control. To get started:

1. Install Git if you haven't already: [https://git-scm.com/downloads](https://git-scm.com/downloads)

2. Initialize the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. Set up remote repository (replace with your actual repository URL):
   ```bash
   git remote add origin https://github.com/cauldron-app/cauldron-app.git
   ```

4. Create and switch to the develop branch:
   ```bash
   git checkout -b develop
   git push -u origin develop
   ```

5. Push the main branch:
   ```bash
   git checkout main
   git push -u origin main
   ```

## Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- Feature branches: Create from `develop` using format `feature/feature-name`
- Bugfix branches: Create from `develop` using format `bugfix/bug-description`
- Release branches: Create from `develop` using format `release/vX.Y.Z`

## CI/CD Pipeline

This repository uses GitHub Actions for continuous integration and deployment:

- Automated linting, type checking, and testing on pull requests
- Semantic versioning and changelog generation on merges to main
- Branch protection rules to enforce code quality

See the `.github/workflows` directory for workflow configurations.
