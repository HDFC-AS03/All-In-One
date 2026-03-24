# GitHub + AWS Setup Guide for CI/CD

This guide matches the workflow at `.github/workflows/ci-cd.yml` and explains all required secrets and setup steps.

## 1. What This Pipeline Expects

Deployment mapping in your workflow:

- naba backend -> instance1
- prasu backend -> instance2
- gateway -> instance3
- keycloak + mailhog + postgres are managed in a separate AWS account

The workflow supports:

- push deploys from `main` or `master`
- manual deploy using `workflow_dispatch`
- manual target selection (`all`, `naba`, `prasu`, `gateway`)
- health check and rollback hooks on each instance
- no deployment of keycloak/mailhog/RDS from this repository workflow

---

## 2. Required GitHub Secrets

Add these in GitHub:

- Repo -> Settings -> Secrets and variables -> Actions -> New repository secret

### 2.1 Global Secret

No global secret is required for image push.

The workflow now uses built-in `${{ github.token }}` to push images to GHCR.

If your EC2 deploy commands need GHCR login for private images, add a separate optional secret only if needed.

### 2.2 Instance 1 (naba) Secrets

- `INSTANCE1_HOST` (EC2 public DNS or IP)
- `INSTANCE1_USER` (typically `ubuntu` for Ubuntu AMI)
- `INSTANCE1_SSH_KEY` (private key in PEM/OpenSSH text)
- `INSTANCE1_PORT` (optional, default 22)
- `INSTANCE1_DEPLOY_COMMAND`
- `INSTANCE1_HEALTHCHECK_COMMAND`
- `INSTANCE1_ROLLBACK_COMMAND`
- `INSTANCE1_MIGRATION_COMMAND` (optional)

### 2.3 Instance 2 (prasu) Secrets

- `INSTANCE2_HOST`
- `INSTANCE2_USER`
- `INSTANCE2_SSH_KEY`
- `INSTANCE2_PORT` (optional)
- `INSTANCE2_DEPLOY_COMMAND`
- `INSTANCE2_HEALTHCHECK_COMMAND`
- `INSTANCE2_ROLLBACK_COMMAND`
- `INSTANCE2_MIGRATION_COMMAND` (optional)

### 2.4 Instance 3 (gateway) Secrets

- `INSTANCE3_HOST`
- `INSTANCE3_USER`
- `INSTANCE3_SSH_KEY`
- `INSTANCE3_PORT` (optional)
- `INSTANCE3_DEPLOY_COMMAND`
- `INSTANCE3_HEALTHCHECK_COMMAND`
- `INSTANCE3_ROLLBACK_COMMAND`

---

## 3. Optional but Recommended GitHub Environments

Create two environments in GitHub:

- `staging`
- `production`

Path:

- Repo -> Settings -> Environments -> New environment

Recommended protections:

- Required reviewers for `production`
- Deployment branches restricted to `main`/`master`
- Environment-specific secrets if you want stricter separation

If you move secrets to environment scope, keep secret names the same.

---

## 4. AWS Setup (EC2 Instances)

## 4.1 Launch 3 EC2 Instances

Create three instances for the deployment targets handled by this workflow:

- EC2 instance1: naba
- EC2 instance2: prasu
- EC2 instance3: gateway

Recommended baseline:

- Ubuntu 22.04 LTS
- t3.small (or higher based on load)
- 20+ GB gp3 storage

## 4.2 Security Group Rules

Inbound (minimum):

- SSH (22) from trusted IPs only (never 0.0.0.0/0 in production)
- App ports only where needed (for example 80/443 for gateway)

Outbound:

- Allow internet access for GHCR pull and package updates

## 4.3 Install Runtime on Each EC2

Run on each instance:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release git jq

# Docker install
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo usermod -aG docker $USER
```

Log out and log in again after user group update.

## 4.4 Prepare App Directories

Example structure:

```bash
sudo mkdir -p /opt/as03/{naba,prasu,gateway}
sudo chown -R $USER:$USER /opt/as03
```

## 4.5 GHCR Login on Instances

Recommended simple approach:

- Keep GHCR packages public for pull
- Skip docker login in deploy commands

If you keep packages private, add your own auth method in deploy commands.

---

## 5. Example Secret Values (Deploy/Health/Rollback)

Use these as templates. Adjust ports, compose files, and service names for your actual setup.

## 5.1 Instance1 (naba)

`INSTANCE1_DEPLOY_COMMAND`

```bash
set -e
cd /opt/as03/naba

# keep previous image tag for rollback
PREV_IMAGE=$(docker inspect --format='{{.Config.Image}}' naba-backend 2>/dev/null || true)
echo "${PREV_IMAGE}" > .prev_image_naba || true

# pull new image and redeploy
NEW_IMAGE="$NABA_IMAGE"
docker pull "$NEW_IMAGE"

docker rm -f naba-backend 2>/dev/null || true
docker run -d --name naba-backend --restart unless-stopped -p 8000:8000 "$NEW_IMAGE"
```

`INSTANCE1_HEALTHCHECK_COMMAND`

```bash
curl -fsS http://localhost:8000/health >/dev/null
```

`INSTANCE1_ROLLBACK_COMMAND`

```bash
set -e
cd /opt/as03/naba
PREV_IMAGE=$(cat .prev_image_naba 2>/dev/null || true)
if [ -n "$PREV_IMAGE" ]; then
  docker rm -f naba-backend 2>/dev/null || true
  docker run -d --name naba-backend --restart unless-stopped -p 8000:8000 "$PREV_IMAGE"
else
  echo "No previous image recorded for rollback"
  exit 1
fi
```

`INSTANCE1_MIGRATION_COMMAND` (if needed)

```bash
cd /opt/as03/naba
# Example only - replace with your real migration command
# docker exec naba-backend alembic upgrade head || true
true
```

## 5.2 Instance2 (prasu)

Same pattern as instance1, replacing image/container names and port as needed.

## 5.3 Instance3 (gateway)

`INSTANCE3_DEPLOY_COMMAND`

```bash
set -e
cd /opt/as03/gateway

PREV_IMAGE=$(docker inspect --format='{{.Config.Image}}' shared-gateway 2>/dev/null || true)
echo "${PREV_IMAGE}" > .prev_image_gateway || true

NEW_IMAGE="$GATEWAY_IMAGE"
docker pull "$NEW_IMAGE"

docker rm -f shared-gateway 2>/dev/null || true
docker run -d --name shared-gateway --restart unless-stopped -p 80:80 "$NEW_IMAGE"
```

`INSTANCE3_HEALTHCHECK_COMMAND`

```bash
curl -fsS http://localhost/health >/dev/null
```

`INSTANCE3_ROLLBACK_COMMAND`

```bash
set -e
cd /opt/as03/gateway
PREV_IMAGE=$(cat .prev_image_gateway 2>/dev/null || true)
if [ -n "$PREV_IMAGE" ]; then
  docker rm -f shared-gateway 2>/dev/null || true
  docker run -d --name shared-gateway --restart unless-stopped -p 80:80 "$PREV_IMAGE"
else
  echo "No previous image recorded for rollback"
  exit 1
fi
```

---

## 6. GitHub Actions Additional Steps

## 6.1 Check Action Permissions

Repo -> Settings -> Actions -> General:

- Workflow permissions: Read and write permissions (or at least enough for package push)
- Allow GitHub Actions to create and approve pull requests: optional

## 6.2 Protect Main Branch

Repo -> Settings -> Branches -> Branch protection rules:

Suggested:

- Require pull request before merge
- Require status checks to pass
- Require branches to be up to date
- Restrict who can push to main

## 6.3 First Dry Run

- Trigger `workflow_dispatch`
- environment = `staging`
- deploy_target = `naba` (or one target first)
- Verify health check passes
- Verify rollback by intentionally failing health check once in staging

---

## 7. AWS Hardening Checklist

- Use separate SSH key per instance
- Restrict SSH source CIDR
- Prefer SSM Session Manager over public SSH for long-term hardening
- Use IAM role for EC2 where possible
- Enable CloudWatch agent for logs/metrics
- Enable instance auto-restart and snapshots
- Keep Docker and OS patched

---

## 8. Troubleshooting

### Issue: Deploy job skipped unexpectedly

Check:

- path filters in `detect-changes`
- branch (`main`/`master`) for push deploy
- manual dispatch `deploy_target`
- missing required secrets

### Issue: Image build skipped unexpectedly

Check:

- `detect-changes` outputs in Actions logs
- changed files actually match filter paths

### Issue: SSH step fails

Check:

- host reachability and security group
- username and key pair match
- `INSTANCE*_PORT` value

### Issue: Rollback not working

Check:

- previous image capture command is running
- rollback command references same container names

---

## 9. Final Validation Before Production

- All required secrets exist
- staging deploy succeeded
- health checks return 200/OK
- rollback tested once per instance
- migration command verified on staging
- branch protection enabled

If all above are green, trigger production deployment from `workflow_dispatch` with reviewer approval enabled on production environment.

---

## 10. Exact End-to-End Steps (Do This In Order)

Follow this sequence exactly for a direct production deployment.

### Step 1: Create AWS EC2 instances

1. Open AWS Console -> EC2 -> Launch instance.
2. Create 3 Ubuntu 22.04 instances.
3. Name them clearly:
  1. as03-instance1-naba
  2. as03-instance2-prasu
  3. as03-instance3-gateway
4. Use a key pair you can safely manage.
5. Attach security group:
  1. SSH 22 only from trusted IP/CIDR
  2. HTTP/HTTPS only where needed (gateway/public services)

### Step 2: Install Docker on each instance

1. SSH into each instance.
2. Run the install block from Section 4.3.
3. Re-login after `usermod -aG docker`.
4. Verify:

```bash
docker --version
docker compose version
```

### Step 3: Prepare deployment folders

1. On each instance:

```bash
sudo mkdir -p /opt/as03/{naba,prasu,gateway}
sudo chown -R $USER:$USER /opt/as03
```

2. Make sure curl exists for health checks:

```bash
sudo apt-get install -y curl
```

### Step 4: Configure GitHub Actions permissions

1. Open GitHub repository -> Settings -> Actions -> General.
2. Set Workflow permissions to Read and write permissions.
3. Save.

### Step 5: Configure GHCR package visibility

Because workflow and deploy commands do not use `GHCR_TOKEN`, package pull should be public.

1. Open GitHub profile/org -> Packages.
2. For each image package (`naba-backend`, `prasu-backend`, `shared-gateway`), set visibility to Public.
3. If you cannot make packages public, switch deploy commands to include your own private registry auth.

### Step 6: Add repository secrets in GitHub

Path: GitHub repo -> Settings -> Secrets and variables -> Actions.

Add all instance secrets from Section 2.2 to 2.4.

Minimum required per instance:

1. `INSTANCE*_HOST`
2. `INSTANCE*_USER`
3. `INSTANCE*_SSH_KEY`
4. `INSTANCE*_DEPLOY_COMMAND`
5. `INSTANCE*_HEALTHCHECK_COMMAND`
6. `INSTANCE*_ROLLBACK_COMMAND`

Optional:

1. `INSTANCE*_PORT`
2. `INSTANCE1_MIGRATION_COMMAND`
3. `INSTANCE2_MIGRATION_COMMAND`

### Step 7: Create GitHub environments

1. GitHub repo -> Settings -> Environments.
2. Create `staging` and `production`.
3. Add required reviewers to `production`.

### Step 8: Add branch protection

1. GitHub repo -> Settings -> Branches.
2. Protect `main` (and/or `master`, based on your release branch).
3. Enable:
  1. Require pull request before merge
  2. Require status checks to pass
  3. Require branches to be up to date

### Step 9: Commit and push workflow/docs

1. Commit `.github/workflows/ci-cd.yml` and this guide.
2. Push to release branch (`main` or `master`).

### Step 10: Run first controlled deployment from GitHub Actions

1. Open GitHub repo -> Actions -> CI-CD -> Run workflow.
2. Set:
  1. environment = `production`
  2. deploy_target = `naba` (start with one target)
3. Run.
4. Approve production environment if approval is required.

### Step 11: Verify in AWS

1. SSH to instance1.
2. Check container:

```bash
docker ps
docker logs --tail=100 naba-backend
```

3. Check health:

```bash
curl -fsS http://localhost:8000/health
```

### Step 12: Deploy remaining targets

Run workflow again with:

1. environment = `production`
2. deploy_target = `prasu`
3. then `gateway`

Or run once with `deploy_target = all` after single-target validation succeeds.

### Step 13: Verify rollback once

1. Temporarily set an invalid healthcheck command for one target in non-critical run.
2. Trigger deployment.
3. Confirm rollback command executes and service restores.
4. Restore correct healthcheck command.

### Step 14: Daily release workflow

After initial setup:

1. Merge code to `main`/`master`.
2. Pipeline runs CI automatically.
3. CD builds only changed images.
4. Deploy jobs run for changed components only.

