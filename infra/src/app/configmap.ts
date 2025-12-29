import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { InfraConfig, getCommonLabels } from "../config";

export interface ConfigMapArgs {
    cfg: InfraConfig;
    namespace: pulumi.Input<string>;
}

/**
 * Create ConfigMap for non-sensitive configuration
 */
export function createConfigMap(args: ConfigMapArgs) {
    const { cfg, namespace } = args;
    const labels = getCommonLabels(cfg);

    const configMap = new k8s.core.v1.ConfigMap(`${cfg.appName}-configmap`, {
        metadata: {
            name: `${cfg.appName}-config`,
            namespace: namespace,
            labels: labels,
        },
        data: {
            NODE_ENV: cfg.environment === "production" ? "production" : "development",
            APP_PORT: cfg.appPort.toString(),
            APP_NAME: cfg.appName,
            APP_URL: `https://${cfg.domain}`,
            LOG_LEVEL: cfg.logLevel,

            // Telemetry ports
            TEMPO_UI_PORT: cfg.tempoPort.toString(),
            TEMPO_OTLP_GRPC_PORT: "4317",
            TEMPO_OTLP_HTTP_PORT: "4318",
            PROMETHEUS_PORT: cfg.prometheusPort.toString(),
            LOKI_PORT: cfg.lokiPort.toString(),
            GRAFANA_PORT: cfg.grafanaPort.toString(),
            METRICS_EXPORTER_PORT: "9464",

            // Telemetry service URLs (internal Kubernetes services)
            TEMPO_URL: "http://tempo:4318",
            LOKI_URL: "http://loki:3100",
        },
    });

    return configMap;
}
