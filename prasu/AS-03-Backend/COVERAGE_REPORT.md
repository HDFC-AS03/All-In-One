# Prasu Backend Test Coverage Report

Date: 2026-03-23
Scope: prasu/AS-03-Backend

## Run Context
Coverage was generated with pytest-cov using the project virtual environment and required Keycloak environment variables.

Ignored test modules for this run:
- tests/test_auth_jwt_utils.py
- tests/test_api_routes.py

Reason for ignore:
- tests/test_auth_jwt_utils.py imports app.auth.jwt_utils, but that module does not exist in the current backend structure.
- tests/test_api_routes.py imports PKCE_VERIFIER_COOKIE from app.api.routes, but that symbol is not present.

## Command Used
PowerShell command used:
- .\venv\Scripts\python.exe -m pytest tests --ignore=tests/test_auth_jwt_utils.py --ignore=tests/test_api_routes.py --cov=app --cov-report=term-missing --cov-report=xml:coverage.xml --cov-report=json:coverage.json

## Test Results
- Collected: 109 tests
- Passed: 99
- Failed: 10
- Duration: 12.17s

## Overall Coverage
- Statements: 316
- Covered: 205
- Missed: 111
- Total coverage: 65%

## Module Coverage Summary
- app/api/routes.py: 42% (157 statements, 91 missed)
- app/auth/dependencies.py: 100% (33 statements, 0 missed)
- app/core/config.py: 100% (13 statements, 0 missed)
- app/core/logging_config.py: 100% (3 statements, 0 missed)
- app/core/response_wrapper.py: 100% (9 statements, 0 missed)
- app/main.py: 0% (6 statements, 6 missed)
- app/services/admin_services.py: 71% (17 statements, 5 missed)
- app/services/app_admin_service.py: 88% (78 statements, 9 missed)

## Key Failure Themes
1. Config contract mismatch in tests vs implementation
- SESSION_SECRET_KEY expected by tests is not present in current Settings model.
- FRONTEND_URL default expected by tests differs from implementation.

2. Security boundary expectations not aligned
- Some tests expect strict rejection (401/403), but current app behavior returns 200/422 in tested paths.

3. Auth dependency API drift
- Security tests patch validate_bearer_token in app.auth.dependencies, but that attribute is not present now.

4. External Keycloak dependency leaking into tests
- Some tests hit localhost:8080 admin endpoints and fail with HTTP 401 due to real external call behavior.

## Coverage Gaps to Prioritize
1. app/api/routes.py (42%)
- OAuth login/callback/refresh flows and many admin route branches are under-tested.

2. app/main.py (0%)
- No tests assert app wiring, middleware stack, or router include behavior.

3. app/services/admin_services.py (71%)
- Negative paths in token retrieval and admin API call handling need stronger coverage.

## Recommended Next Steps
1. Repair stale tests to current architecture
- Update/remove imports for non-existent app.auth.jwt_utils and removed PKCE_VERIFIER_COOKIE.

2. Stabilize tests with fixtures
- Provide test env defaults via pytest fixtures or test .env.
- Mock all external Keycloak HTTP calls.

3. Raise route coverage
- Add targeted tests for login, callback, refresh, logout, CSRF validation, and admin route authorization.

4. Add app initialization tests
- Cover app/main.py startup wiring and API route registration.

## Artifacts Generated
- coverage.xml
- coverage.json
- terminal missing-lines report from pytest-cov
