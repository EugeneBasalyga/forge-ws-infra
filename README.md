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

  * Node.js **>= 22**
  * Yarn 1 (classic): ```npm i -g yarn```
  * Docker Desktop, running. The database uses port **5432** and the service uses port **1111**, so both must be free

## Local setup from scratch

  1. Clone all four repositories into one `forge-ws` folder. The folder names matter: repos link **forge-ws-common** via `link:../forge-ws-common` and pm2 starts `../forge-service-app`
  ```
  mkdir forge-ws && cd forge-ws
  git clone https://github.com/EugeneBasalyga/forge-ws-infra.git
  git clone https://github.com/EugeneBasalyga/forge-ws-common.git
  git clone https://github.com/EugeneBasalyga/forge-ws-db.git
  git clone https://github.com/EugeneBasalyga/forge-service-app.git
  ```

  2. Copy env files. The defaults match each other and the local docker database, nothing needs editing
  ```
  (cd forge-ws-infra && cp .env.example .env)
  (cd forge-ws-db && cp .env.example .env)
  ```

  3. Install dependencies, **forge-ws-common** first
  ```
  (cd forge-ws-common && yarn)
  (cd forge-ws-db && yarn)
  (cd forge-service-app && yarn)
  (cd forge-ws-infra && yarn)
  ```

  4. Start the database
  ```
  cd forge-ws-infra
  yarn db:start
  ```

  5. Run migrations
  ```
  cd ../forge-ws-db
  yarn db:migrate
  ```

  6. Create the tenant. Use this exact id: the mobile app's `.env.example` points to it (`EXPO_PUBLIC_API_TENANT_ID`)
  ```
  yarn db:init-tenant --tenantId "bc129742-38aa-4cf2-98a9-5ea2fd340c65" --tenantName "Main"
  ```

  7. Seed test users. Every user gets the same 3-session training plan with exercises, nothing completed. The script **wipes all existing users of the tenant** (with their progress and chat) before seeding, so re-run it to reset the demo
  ```
  yarn db:init-users --tenantId "bc129742-38aa-4cf2-98a9-5ea2fd340c65" --email "basalygaeugene@gmail.com" --count 5 --password "Password123!"
  ```
  This creates `basalygaeugene@gmail.com`, `basalygaeugene1@gmail.com` ... `basalygaeugene4@gmail.com`, all with password `Password123!`

  8. Start the service
  ```
  cd ../forge-ws-infra
  yarn start:dev
  ```

  9. Check that it works
      * Swagger UI: http://localhost:1111/v1/openapi
      * Login:
      ```
      curl -X POST http://localhost:1111/v1/tenants/bc129742-38aa-4cf2-98a9-5ea2fd340c65/auth/login \
        -H 'Content-Type: application/json' \
        -d '{"tenantId":"bc129742-38aa-4cf2-98a9-5ea2fd340c65","email":"basalygaeugene@gmail.com","password":"Password123!"}'
      ```
      It returns `{ accessToken, refreshToken }`

## Connecting the mobile app

  * The mobile app reads `EXPO_PUBLIC_API_URL` (default `http://localhost:1111/v1`) and `EXPO_PUBLIC_API_TENANT_ID` from its `.env`
  * The iOS simulator reaches the service on `localhost`. The Android emulator needs `http://10.0.2.2:1111/v1`, and a physical device needs your machine's LAN IP, e.g. `http://192.168.0.10:1111/v1`

## Development

### Rules

  * In **ecosystem.config.js** add every new service and pass all needed env variables

### Everyday commands

**DB**

  * Start local docker database
  ```
  yarn db:start
  ```

  * Stop local docker database (data is kept in the volume)
  ```
  yarn db:stop
  ```

  * Wipe the database completely, then repeat steps 4–7 of the setup
  ```
  yarn db:stop
  docker volume rm forge-ws-infra_forge-pg-data
  ```

  * Migrations and db scripts: see **forge-ws-db** README

**PM2**

  * Start local services (pm2 watches `forge-service-app/src` and restarts on changes)
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

## Troubleshooting

  * **Port 5432 is already allocated**: another PostgreSQL is running. Stop it, or change `DB_PORT` in both `.env` files and `DB_CONNECTION_STRING` in **forge-ws-infra/.env**
  * **Login returns `400` "tenantId is required"**: the tenant id must be in the URL and in the body
  * **Login returns `400` for a valid tenant id**: the tenant doesn't exist yet, run step 6
  * **The service is `errored` in `npx pm2 list`**: check `npx pm2 logs`. Usually the database isn't running or the migrations weren't applied
