# @forge/forge-ws-infra

## Overview

  * This repository is the local orchestrator for the backend. It sits next to the other repositories in the workspace folder:
  ```
  forge-ws/
  ├── forge-ws-infra      # this repo: docker database + pm2 ecosystem
  ├── forge-ws-common     # shared code, linked into other repos
  ├── forge-ws-db         # migrations and db scripts
  └── forge-service-app   # service-app
  ```

  * **docker-compose.db.yml** runs the PostgreSQL database in docker. Data is kept in the `forge-pg-data` docker volume.

  * **ecosystem.config.js** runs all services locally via pm2 with env variables from **.env**.

  * When you add a new env variable to **.env** also update **.env.example**.

## Preconditions

  * Docker desktop must be installed to run the database

  * Copy env variables to **.env** file
  ```
  cp .env.example .env
  ```

  * Install dependencies in every repository (**forge-ws-common** first, other repos link to it)
  ```
  (cd ../forge-ws-common && yarn)
  (cd ../forge-ws-db && yarn)
  (cd ../forge-service-app && yarn)
  yarn
  ```

## Development

### Rules

  * In **ecosystem.config.js** add every new service and pass all needed env variables

### Install and run

**DB**

  * Start local docker database
  ```
  yarn db:start
  ```

  * Stop local docker database
  ```
  yarn db:stop
  ```

  * Run migrations — see **forge-ws-db** README

**PM2**

  * Start local services
  ```
  yarn start:dev
  ```

  * Stop and remove local services
  ```
  yarn stop:dev
  ```

  * To log pm2 outputs use ```npx pm2 logs```
  * To list pm2 services use ```npx pm2 list```
  * To kill pm2 daemon use ```npx pm2 kill```
