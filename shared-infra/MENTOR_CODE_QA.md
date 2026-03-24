# Mentor Code Q&A Bank

## Purpose
This document is a ready-to-use question bank for mentor discussions, code walkthroughs, viva rounds, and technical reviews.

Use it to evaluate:
- Conceptual clarity
- Practical debugging skills
- Security awareness
- System design reasoning
- Code quality judgment

---

## Section 1: API Gateway (OpenResty + Lua)

### Q1. Why use an API Gateway in this project?
A. It centralizes auth validation, CORS, and rate limiting before requests reach backend services. This keeps security and cross-cutting concerns out of business logic.

### Q2. What does access_by_lua_file do in NGINX?
A. It executes Lua logic during the access phase. If validation fails, the request is blocked before proxying to backend.

### Q3. How is JWT extracted in this gateway?
A. Token priority is:
1. Authorization header with Bearer token
2. access_token cookie fallback

### Q4. Why is RS256 preferred here over HS256?
A. RS256 uses asymmetric keys. Keycloak signs with private key; gateway verifies with public key. Verification can happen safely without sharing a signing secret.

### Q5. What is JWKS and why cache it?
A. JWKS is a public key set from Keycloak used for signature verification. Caching reduces latency and avoids requesting keys on every API call.

### Q6. What happens when token kid is not found in cached JWKS?
A. Gateway forces a JWKS refresh and retries key lookup. This handles key rotation.

### Q7. Which claims are validated and why?
A. Typical checks include:
- exp: token must not be expired
- nbf: token must be valid for current time
- iss: token issuer must be trusted

### Q8. Why inject identity headers like X-User-ID?
A. Backend can trust normalized identity context from gateway instead of re-parsing token on every endpoint.

### Q9. How is rate limiting applied?
A. Token-bucket limiter is used. For authenticated users key is sub claim; for unauthenticated traffic key is client IP.

### Q10. What is the risk if backend is publicly exposed directly?
A. Attackers may bypass gateway checks and forge identity headers. Network isolation is critical.

---

## Section 2: Backend (FastAPI)

### Q11. Why should backend still perform minimal auth sanity checks even with gateway auth?
A. Defense in depth. Backend should verify expected gateway headers exist and reject impossible/malformed identity payloads.

### Q12. What is a dependency injection use-case in FastAPI auth?
A. A dependency function can parse gateway headers once and provide user context to all protected routes.

### Q13. How do you differentiate 401 vs 403?
A.
- 401: user is unauthenticated or token invalid
- 403: user is authenticated but lacks permissions

### Q14. Where should role checks live?
A. In route dependencies or authorization service layer, not scattered in handlers.

### Q15. How should backend handle X-User-Roles header safely?
A. Parse JSON defensively, default to empty roles on malformed input, and reject requests where parsing fails in strict mode.

### Q16. What is idempotency and where is it useful?
A. Repeating a request should have same result. Useful for payment-like writes and retry-safe endpoints.

### Q17. How would you add request tracing?
A. Attach a request ID at gateway or backend middleware and include it in logs and responses.

### Q18. What common bug appears in async Python services?
A. Blocking operations inside async handlers (CPU-heavy or sync I/O) causing throughput collapse.

---

## Section 3: Frontend

### Q19. Why store access tokens in httpOnly cookies instead of localStorage?
A. httpOnly cookies reduce XSS token theft risk because JavaScript cannot read them directly.

### Q20. Why use CSRF token when cookies are used for auth?
A. Cookies are sent automatically by browser; CSRF token prevents cross-site forged requests.

### Q21. How should frontend call protected API routes?
A. Include credentials in requests and add CSRF header for state-changing operations.

### Q22. What is optimistic UI update and what is the risk?
A. UI updates before server confirms. Risk is stale/incorrect UI if request later fails.

### Q23. How do you debug CORS issues quickly?
A.
1. Check browser network tab for preflight OPTIONS
2. Verify Access-Control-Allow-Origin and credentials flags
3. Confirm allowed headers include custom headers like X-CSRF-Token

### Q24. What is a common frontend auth anti-pattern?
A. Scattering token refresh logic across components instead of centralizing in an API client layer.

---

## Section 4: Security

### Q25. What is the purpose of validating token issuer?
A. Prevent accepting tokens minted by an untrusted identity provider.

### Q26. What is the difference between authentication and authorization?
A.
- Authentication: who the user is
- Authorization: what the user can do

### Q27. Why should algorithm be checked explicitly in JWT header?
A. To prevent downgrade or algorithm confusion attacks.

### Q28. What is least privilege in role design?
A. Users/services should get only minimum permissions required for current tasks.

### Q29. How can logs become a security issue?
A. Logging raw tokens, secrets, or PII can leak credentials and user data.

### Q30. What is replay attack risk in token-based systems?
A. Stolen valid token can be reused until expiration unless additional controls exist.

---

## Section 5: Docker and Infra

### Q31. Why split shared auth infra from app compose files?
A. It allows multiple app stacks to reuse the same Keycloak and gateway services cleanly.

### Q32. Why use service aliases like app1-backend and app2-backend?
A. Stable DNS names inside Docker network independent of container names.

### Q33. What does depends_on not guarantee?
A. It does not guarantee service readiness, only startup ordering.

### Q34. Why mount nginx.conf and lua as volumes in dev?
A. Fast iteration: config/script changes apply without rebuilding image.

### Q35. What is a healthy way to validate compose changes?
A. Run compose config to validate syntax and resolved config before startup.

---

## Section 6: Testing and Quality

### Q36. What test types are important here?
A.
- Unit tests for auth utilities and services
- Integration tests for API routes and dependencies
- Security boundary tests for unauthorized access

### Q37. What is a strong test for gateway header trust?
A. Verify direct backend requests with forged X-User-* headers are rejected in real deployment topology.

### Q38. How do you test JWT expiry logic?
A. Generate tokens around boundary times and assert strict behavior before/at/after expiry.

### Q39. Why include negative test cases?
A. Most security and reliability bugs happen in invalid/malicious paths, not happy paths.

### Q40. What should PR reviewers prioritize first?
A. Security impact, behavior regressions, missing tests, and operational risks.

---

## Section 7: Debugging Scenarios

### Q41. User gets 401 from gateway but token exists. What do you check first?
A.
1. Issuer mismatch
2. Signature verification failure
3. Token expiration and nbf
4. Missing/incorrect Bearer format

### Q42. User gets 503 Auth unavailable. Likely causes?
A. Gateway cannot fetch JWKS due to Keycloak unavailability, DNS issue, or network path failure.

### Q43. Frequent 429 responses after login. What could be wrong?
A. Overly strict limiter settings or shared key collision causing many users to consume same bucket.

### Q44. CORS preflight fails only for POST. Why?
A. Allowed headers or methods likely missing required values (for example X-CSRF-Token or Content-Type variants).

### Q45. Backend sees empty user headers intermittently. Possible reason?
A. Requests may be hitting an unprotected route path variant or bypassing expected gateway path.

---

## Section 8: Design and Trade-off Questions

### Q46. Why not validate JWT in every backend service instead of gateway?
A. Central gateway simplifies consistency, but service-level validation can still be useful for zero-trust internal architectures.

### Q47. What is the trade-off of long JWKS cache TTL?
A.
- Pros: lower latency and lower IdP load
- Cons: slower adaptation after key rotation

### Q48. Why is static CORS origin allowlist better than wildcard with credentials?
A. Wildcard origin cannot be safely combined with credentialed requests and increases attack surface.

### Q49. What does defense in depth mean in this stack?
A. Gateway validation + backend validation + network isolation + secure cookie strategy + tests.

### Q50. If system scales to many backends, what should evolve?
A. Route management, observability, service discovery, and policy-as-code for auth/rate-limits.

---

## Rapid-Fire Mentor Round (One-liners)

1. Difference between 401 and 403?
2. Why exp and nbf both needed?
3. Why validate iss?
4. Why avoid localStorage for access token?
5. What is JWKS key rotation?
6. Why rate-limit after auth?
7. What does shared Docker network provide?
8. Why include request ID in logs?
9. What is the risk of logging bearer token?
10. What breaks when CORS and credentials are misconfigured?

---

## Mentor Evaluation Rubric

Score each area from 1 to 5:
- Security fundamentals
- Debugging depth
- System understanding
- Code quality judgment
- Testing mindset
- Communication clarity

Suggested interpretation:
- 24-30: ready for ownership
- 16-23: good, needs guided practice
- 10-15: needs fundamentals strengthening
- Below 10: needs close mentoring plan

---

## How to Use This During Review

1. Start with 5 rapid-fire questions.
2. Pick 2 scenario-based debugging questions.
3. Ask 1 design trade-off question.
4. End with one improvement task: small patch + test.
5. Score with rubric and define next learning target.
