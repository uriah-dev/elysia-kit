# Elysia with Bun runtime

## Development

To start the development server run:

```bash
bun run dev
```

## Telemetry & Observability

This project includes a full observability stack with Tempo (tracing), Prometheus (metrics), Loki (logs), and Grafana (visualization).

### Start Telemetry Services

```bash
# Generate prometheus.yml from environment variables and start all services
bun run telemetry:up

# Or manually generate config and start
bun run generate:prometheus
docker compose up -d

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f grafana

# Stop all services
bun run telemetry:down
# Or: docker compose down

# Restart a specific service
docker compose restart tempo
```

**Note:** `prometheus.yml` is auto-generated from the `METRICS_EXPORTER_PORT` environment variable. If you change this port, regenerate the config with `bun run generate:prometheus`.

### Service URLs

| Service    | URL                   | Purpose                 |
| ---------- | --------------------- | ----------------------- |
| Grafana    | http://localhost:3001 | Visualization dashboard |
| Prometheus | http://localhost:9090 | Metrics queries         |
| Tempo      | http://localhost:3200 | Tracing backend         |
| Loki       | http://localhost:3100 | Logs backend            |

### View in Grafana

1. Open http://localhost:3001
2. Go to **Explore** (compass icon)
3. Select data source:
   - **Prometheus** — for metrics
   - **Tempo** — for traces
   - **Loki** — for logs
