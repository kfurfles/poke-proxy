# Front-end (Vite + React)

React SPA built with Vite, TanStack Router/Query, and Tailwind CSS.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint` (Biome)
- `npm run lint:fix` (Biome)
- `npm run format` (Biome)
- `npm run api:generate` (Orval + Biome format on generated code)

## Docker

The front-end is containerized using a multi-stage Dockerfile:

1. **Build stage**: Node.js 22 Alpine compiles the Vite app
2. **Runtime stage**: Nginx 1.27 Alpine serves static assets

### Build & Run

```bash
# From front-end directory
docker build -t poke-proxy-frontend .
docker run -p 5173:80 poke-proxy-frontend
```

### Docker Compose

The front-end is included in the root `docker-compose.yml` and automatically starts with:

```bash
# From repo root
make demo
```

This will open the frontend at `http://localhost:5173` (configurable via `FRONT_PORT`).
