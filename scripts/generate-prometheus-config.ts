#!/usr/bin/env bun
import { writeFileSync } from "fs";
import { join } from "path";

const METRICS_EXPORTER_PORT = process.env.METRICS_EXPORTER_PORT || "9464";

const config = `global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "elysia_app"
    static_configs:
      - targets: ["host.docker.internal:${METRICS_EXPORTER_PORT}"]
`;

const configPath = join(process.cwd(), "prometheus.yml");
writeFileSync(configPath, config, "utf-8");

console.log(
  `✅ Generated prometheus.yml with METRICS_EXPORTER_PORT=${METRICS_EXPORTER_PORT}`
);
