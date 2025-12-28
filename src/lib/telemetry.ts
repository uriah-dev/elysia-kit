import { opentelemetry } from "@elysiajs/opentelemetry";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { MeterProvider } from "@opentelemetry/sdk-metrics";
import { metrics } from "@opentelemetry/api";
import { env } from "@src/env";
import type { HTTPMethod } from "elysia";
import { hasValue } from "./utils";
import { logger } from "./logger";

const traceExporter = new OTLPTraceExporter({
  url: `http://localhost:${env.TEMPO_OTLP_HTTP_PORT}/v1/traces`,
});

const metricsExporter = new PrometheusExporter(
  { port: env.METRICS_EXPORTER_PORT },
  () => {
    logger.info(
      `📊 Prometheus metrics available at http://localhost:${env.METRICS_EXPORTER_PORT}/metrics`
    );
  }
);

const meterProvider = new MeterProvider({
  readers: [metricsExporter],
});
metrics.setGlobalMeterProvider(meterProvider);

export const getMeter = () => metrics.getMeter(env.APP_NAME);

export const telemetry = opentelemetry({
  spanProcessors: [new BatchSpanProcessor(traceExporter)],
});

export const createCounter = (name: string, description?: string) =>
  getMeter().createCounter(name, {
    description: hasValue(description) ? description : `${name} route`,
  });

export const createHistogram = (name: string, description?: string) =>
  getMeter().createHistogram(name, { description });

export const createGauge = (name: string, description?: string) =>
  getMeter().createObservableGauge(name, { description });

export const addMetric = (
  counter: ReturnType<typeof createCounter>,
  labels: { endpoint: string; method: HTTPMethod }
) => {
  counter.add(1, labels);
};
