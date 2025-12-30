import { opentelemetry } from "@elysiajs/opentelemetry";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { MeterProvider } from "@opentelemetry/sdk-metrics";
import { metrics } from "@opentelemetry/api";
import { env } from "@src/env";
import type { Elysia, HTTPMethod } from "elysia";
import { hasValue, buildServiceUrl } from "./utils";
import { logger } from "./logger";

const traceExporter = env.TRACING_ENABLED && env.TEMPO_OTLP_HTTP_PORT
  ? new OTLPTraceExporter({
    url: env.TEMPO_URL
      ? `${env.TEMPO_URL}/v1/traces`
      : buildServiceUrl(env.TEMPO_OTLP_HTTP_PORT, "/v1/traces"),
  })
  : null;

const metricsExporter = env.METRICS_ENABLED && env.METRICS_EXPORTER_PORT
  ? new PrometheusExporter({ port: env.METRICS_EXPORTER_PORT }, () => {
    logger.info(
      `📊 Prometheus metrics available at ${buildServiceUrl(
        env.METRICS_EXPORTER_PORT!,
        "/metrics"
      )}`
    );
  })
  : null;

if (metricsExporter) {
  const meterProvider = new MeterProvider({
    readers: [metricsExporter],
  });
  metrics.setGlobalMeterProvider(meterProvider);
}

export const getMeter = () => metrics.getMeter(env.APP_NAME);

export const telemetry = env.TRACING_ENABLED && traceExporter
  ? opentelemetry({
    spanProcessors: [new BatchSpanProcessor(traceExporter)],
  })
  : (app: Elysia) => app;

export const createCounter = (name: string, description?: string) => {
  if (!env.METRICS_ENABLED) {
    return { add: () => { } } as ReturnType<ReturnType<typeof getMeter>["createCounter"]>;
  }
  return getMeter().createCounter(name, {
    description: hasValue(description) ? description : `${name} route`,
  });
};

export const createHistogram = (name: string, description?: string) => {
  if (!env.METRICS_ENABLED) {
    return { record: () => { } } as ReturnType<ReturnType<typeof getMeter>["createHistogram"]>;
  }
  return getMeter().createHistogram(name, { description });
};

export const createGauge = (name: string, description?: string) => {
  if (!env.METRICS_ENABLED) {
    return { addCallback: () => { }, removeCallback: () => { } } as ReturnType<ReturnType<typeof getMeter>["createObservableGauge"]>;
  }
  return getMeter().createObservableGauge(name, { description });
};

export const addMetric = (
  counter: ReturnType<typeof createCounter>,
  labels: { endpoint: string; method: HTTPMethod }
) => {
  if (env.METRICS_ENABLED) {
    counter.add(1, labels);
  }
};
