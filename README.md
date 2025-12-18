# Poke Proxy (Backend)

Proxy built with **NestJS** for the **PokeAPI**.

- **Core (challenge)**: `GET /pokemon` and `GET /pokemon/:name` (with `abilities[].name` **sorted**)
- **Extras (showcase)**: cache (Redis) + observability (Grafana/Prometheus/Loki/Tempo) + optional warm-up (Gemini)

## How to run & validate (60s)

### Challenge scope (core)

- **PokeAPI proxy**
- **List**: `GET /pokemon?limit=10..20&offset>=0`
- **Details**: `GET /pokemon/:name`
- **Quality**: `abilities[].name` is **alphabetically sorted**

### Setup — via root `Makefile`

From the repo root (`poke-proxy/`):

```bash
make demo BACKEND_PORT=3002
```

Backend API's:

```bash
curl -s "http://localhost:3002/pokemon?limit=20&offset=0" | head -c 250 && echo
curl -s "http://localhost:3002/pokemon/pikachu" | head -c 250 && echo
curl -s "http://localhost:3002/pokemon/pikachu" | jq '.abilities | map(.name)'
```

### Structure

- `src/modules/pokemon/`
  - `pokemon.controller.ts`: routes + status codes (400/404)
  - `dto/`: validation for `limit/offset` and `:name`
  - `use_cases/`
    - `list_pokemons.service.ts`: pagination + list cache
    - `get_pokemon_by_name.service.ts`: details + transformation + **ability sorting**
    - `warmup_famous_pokemons.use_case.ts`: optional warm-up
  - `services/pokemon_api.ts`: PokeAPI client (types/contracts)
- `src/shared/`
  - `cache/`: Redis + `withCache()` helper (cache-aside)
  - `metrics/`: interceptor + `/metrics` (Prometheus)
  - `logger/`: Winston JSON + daily rotation
  - `middleware/`: correlation id (`X-Correlation-ID`)
  - `throttler/`: rate limit via Nest Throttler
- `src/otel.ts`: OpenTelemetry auto-instrumentation (NodeSDK + OTLP HTTP exporter)

### Decisions (KISS)

- **Short TTL (60s)**: better latency without cache invalidation complexity.
- **Graceful cache degradation**: if Redis fails, cache is bypassed and the API still responds via PokeAPI.

### Components

- `backend`: NestJS API (Swagger at `http://localhost:<BACKEND_PORT>/api/docs`)
- `redis`: API cache
- `grafana`: dashboards + Explore (UI at `http://localhost:3000`)
- `prometheus`: scrapes backend metrics (`/metrics`) (UI at `http://localhost:9090`)
- `tempo`: traces (UI/API at `http://localhost:3200`)
- `loki`: logs (API at `http://localhost:3100`)
- `promtail`: tails `../backend/logs/*.log` and ships to Loki (no UI)

## URL's

- **Swagger**: `http://localhost:<BACKEND_PORT>/api/docs`
- **Metrics (raw)**: `http://localhost:<BACKEND_PORT>/metrics`
- **Logs (file)**: `backend/logs/app-YYYY-MM-DD.log` (also visible in Grafana via Loki)
- **Grafana**:
  - Dashboard: `http://localhost:3000/d/poke-proxy-observability/poke-proxy-observability?orgId=1`
  - Explore: `http://localhost:3000/explore`
- **Tempo (traces)**: `http://localhost:3200` (generate a trace by calling `/pokemon/pikachu`)

## Cache Warm-up (extra / optional))

**Goal**: warm the cache on startup for demo purposes (reduce cold-start). **Not part of the core challenge**.

Runs when:

- `WARMUP_FAMOUS_POKEMON_CACHE=true`
- `GEMINI_API_KEY` is set
- `NODE_ENV !== test`

Note: if `GEMINI_API_KEY` is missing, warm-up is **skipped** (non-fatal).

## Tests (CI)

Tests run in **GitHub Actions** (workflow `CI`) on every push/PR:

- Backend: unit (`npm test`)
- Backend: e2e (`npm run test:e2e`)
- Front: build (`npm run build`)
