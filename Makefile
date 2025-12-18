# Poke Proxy - Root Makefile (objetivo)

SHELL := /bin/bash

OPEN ?= open

BACKEND_PORT ?= 3001
FRONT_PORT ?= 5173
GRAFANA_PORT ?= 3000
TEMPO_PORT ?= 3200

BACKEND_URL := http://localhost:$(BACKEND_PORT)
SWAGGER_URL := $(BACKEND_URL)/api/docs
FRONT_URL := http://localhost:$(FRONT_PORT)
GRAFANA_URL := http://localhost:$(GRAFANA_PORT)
GRAFANA_EXPLORE_URL := $(GRAFANA_URL)/explore
GRAFANA_DASHBOARD_URL := $(GRAFANA_URL)/d/poke-proxy-observability/poke-proxy-observability?orgId=1
TEMPO_URL := http://localhost:$(TEMPO_PORT)

.PHONY: up
up:
	@cd infra && BACKEND_PORT=$(BACKEND_PORT) docker compose up -d --build

.PHONY: down
down:
	@cd infra && docker compose down

.PHONY: open-swagger
open-swagger:
	@$(OPEN) "$(SWAGGER_URL)"

.PHONY: open-front
open-front:
	@$(OPEN) "$(FRONT_URL)"

.PHONY: open-explore
open-explore:
	@$(OPEN) "$(GRAFANA_EXPLORE_URL)"

.PHONY: open-dashboard
open-dashboard:
	@$(OPEN) "$(GRAFANA_DASHBOARD_URL)"

.PHONY: open-tempo
open-tempo:
	@$(OPEN) "$(TEMPO_URL)"

.PHONY: open-all
open-all: open-swagger open-front open-explore open-dashboard open-tempo

.PHONY: demo
demo: up open-all



# -----------------------------
# CI helpers (run from repo root)
# -----------------------------

BACKEND_DIR ?= backend
FRONTEND_DIR ?= front-end

.PHONY: backend-install
backend-install:
	npm --prefix $(BACKEND_DIR) ci

.PHONY: backend-test
backend-test:
	npm --prefix $(BACKEND_DIR) test

.PHONY: backend-test-ci
backend-test-ci:
	npm --prefix $(BACKEND_DIR) run test:ci

.PHONY: backend-test-e2e
backend-test-e2e:
	npm --prefix $(BACKEND_DIR) run test:e2e

.PHONY: frontend-install
frontend-install:
	npm --prefix $(FRONTEND_DIR) ci

.PHONY: frontend-build
frontend-build:
	npm --prefix $(FRONTEND_DIR) run build

.PHONY: ci-backend-unit
ci-backend-unit: backend-install backend-test

.PHONY: ci-backend-e2e
ci-backend-e2e: backend-install backend-test-e2e

.PHONY: ci-frontend-build
ci-frontend-build: frontend-install frontend-build

.PHONY: ci
ci: ci-backend-unit ci-backend-e2e ci-frontend-build
