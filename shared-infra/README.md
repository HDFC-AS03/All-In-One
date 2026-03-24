# Shared Infra

This shared stack is kept outside app folders so multiple applications can reuse one API gateway and one Keycloak instance.

## What Runs

- `gateway` (OpenResty/Nginx API gateway) on port `80`
- `keycloak` on port `8080`
- `postgres` (for Keycloak) on port `5432`
- `mailhog` (SMTP + UI) on ports `1025` and `8025`

## Prerequisites

- Docker Desktop running
- Docker Compose v2 (`docker compose` command)

## Quick Start (Run Everything)

Run from workspace root (folder that contains `shared-infra/`):

```bash
docker compose -p shared-infra -f shared-infra/docker-compose.yml up -d --build
```

Check services:

```bash
docker compose -p shared-infra -f shared-infra/docker-compose.yml ps
```

View logs (all services):

```bash
docker compose -p shared-infra -f shared-infra/docker-compose.yml logs -f
```

## Access URLs

- Gateway: http://localhost
- Keycloak: http://localhost:8080
- MailHog UI: http://localhost:8025

## Keycloak Admin Login

- Username: `superadmin`
- Password: `hdfcintern`

## Common Commands

Stop services:

```bash
docker compose -p shared-infra -f shared-infra/docker-compose.yml down
```

Restart services:

```bash
docker compose -p shared-infra -f shared-infra/docker-compose.yml down
docker compose -p shared-infra -f shared-infra/docker-compose.yml up -d --build
```

Reset everything (including DB data volume):

```bash
docker compose -p shared-infra -f shared-infra/docker-compose.yml down -v
docker compose -p shared-infra -f shared-infra/docker-compose.yml up -d --build
```

## Notes

- Gateway (OpenResty + Lua) is built and runs from `./gateway/` in this folder.
- Gateway config: `./gateway/nginx.conf`.
- Gateway Lua scripts: `./gateway/lua/`.
- Keycloak theme is sourced from `naba/AS-03-Backend/docker-compose/theme` (or `prasu/AS-03-Backend/docker-compose/theme`).
- App backends should attach to external network `shared-auth-network`.
