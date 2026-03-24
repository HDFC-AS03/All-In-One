# Shared Gateway + Keycloak Setup

Shared infrastructure is outside the backend folder for modular reuse.

Run all commands below from workspace root:

`C:/Users/JOYNU/Desktop/New folder`

## 1) Start shared infrastructure

```bash
docker compose -p shared-infra -f shared-infra/docker-compose.yml up -d --build
```

This starts:

- gateway
- keycloak
- postgres

and creates the reusable network:

- shared-auth-network

## 2) Start app1 stack (backend + frontend + mailhog)

```bash
docker compose -p as03-app1 -f AS-03-Backend/docker-compose/docker-compose.yml up -d --build
```

This starts:

- backend (port 8000)
- frontend (port 5173)
- mailhog (ports 1025, 8025)

## 3) Verify both stacks

```bash
docker compose -p shared-infra -f shared-infra/docker-compose.yml ps
docker compose -p as03-app1 -f AS-03-Backend/docker-compose/docker-compose.yml ps
```

## 4) Test through gateway

```bash
(Invoke-WebRequest -Uri "http://localhost/health" -UseBasicParsing).Content
```

Expected response:

```json
{"status":"ok"}
```

## Common Error

If you run this from root, it fails:

```bash
docker compose -p as03-app1 -f docker-compose.yml up -d --build
```

Reason: there is no compose file at root.

Use this instead:

```bash
docker compose -p as03-app1 -f AS-03-Backend/docker-compose/docker-compose.yml up -d --build
```

## One-time cleanup (only if migrating from older setup)

```bash
docker rm -f keycloak-postgres keycloak api-gateway backend-app1 mailhog
docker network rm shared-auth-network
```

If those resources do not exist, Docker will print "No such container" or "network not found". That is safe to ignore.

## Stop stacks

```bash
docker compose -p as03-app1 -f AS-03-Backend/docker-compose/docker-compose.yml down
docker compose -p shared-infra -f shared-infra/docker-compose.yml down
```

## Current Gateway Target

Gateway proxies app1 traffic to backend alias:

- app1-backend:8000
