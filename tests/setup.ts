// Test environment setup
// Set test environment variables before importing app modules

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.APP_PORT = "3000";
process.env.APP_NAME = "elysia-kit-test";
process.env.APP_URL = "http://localhost:3000";
process.env.LOG_LEVEL = "fatal";

// Telemetry ports (defaults)
process.env.TEMPO_UI_PORT = "3200";
process.env.TEMPO_OTLP_GRPC_PORT = "4317";
process.env.TEMPO_OTLP_HTTP_PORT = "4318";
process.env.PROMETHEUS_PORT = "9090";
process.env.LOKI_PORT = "3100";
process.env.GRAFANA_PORT = "3001";
process.env.METRICS_EXPORTER_PORT = "9464";
