import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { InfraConfig, getCommonLabels } from "../config";

export interface TempoArgs {
  cfg: InfraConfig;
  namespace: pulumi.Input<string>;
}

/**
 * Create Tempo deployment for distributed tracing
 */
export function createTempo(args: TempoArgs) {
  const { cfg, namespace } = args;
  const labels = { ...getCommonLabels(cfg), component: "tempo" };

  // Tempo ConfigMap
  const configMap = new k8s.core.v1.ConfigMap(`${cfg.appName}-tempo-config`, {
    metadata: {
      name: "tempo-config",
      namespace: namespace,
      labels: labels,
    },
    data: {
      "tempo.yaml": `
stream_over_http_enabled: true
server:
  http_listen_port: 3200
  log_level: info

query_frontend:
  search:
    duration_slo: 5s
    throughput_bytes_slo: 1.073741824e+09
  trace_by_id:
    duration_slo: 5s

distributor:
  receivers:
    otlp:
      protocols:
        http:
          endpoint: 0.0.0.0:4318
        grpc:
          endpoint: 0.0.0.0:4317

ingester:
  max_block_duration: 5m

compactor:
  compaction:
    block_retention: 1h

metrics_generator:
  registry:
    external_labels:
      source: tempo
      cluster: \${cfg.environment}
  storage:
    path: /tmp/tempo/generator/wal
    remote_write:
      - url: http://prometheus:9090/api/v1/write
        send_exemplars: true

storage:
  trace:
    backend: local
    wal:
      path: /tmp/tempo/wal
    local:
      path: /tmp/tempo/blocks

overrides:
  defaults:
    metrics_generator:
      processors: [service-graphs, span-metrics, local-blocks]
`,
    },
  });

  // Tempo Deployment
  const deployment = new k8s.apps.v1.Deployment(`${cfg.appName}-tempo`, {
    metadata: {
      name: "tempo",
      namespace: namespace,
      labels: labels,
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {
          app: cfg.appName,
          component: "tempo",
        },
      },
      template: {
        metadata: {
          labels: labels,
        },
        spec: {
          containers: [
            {
              name: "tempo",
              image: "grafana/tempo:latest",
              args: ["-config.file=/etc/tempo/tempo.yaml"],
              ports: [
                { containerPort: 3200, name: "http" },
                { containerPort: 4317, name: "otlp-grpc" },
                { containerPort: 4318, name: "otlp-http" },
              ],
              volumeMounts: [
                {
                  name: "config",
                  mountPath: "/etc/tempo",
                },
              ],
              resources: {
                requests: { cpu: "100m", memory: "256Mi" },
                limits: { cpu: "500m", memory: "512Mi" },
              },
            },
          ],
          volumes: [
            {
              name: "config",
              configMap: { name: configMap.metadata.name },
            },
          ],
        },
      },
    },
  });

  // Tempo Service
  const service = new k8s.core.v1.Service(`${cfg.appName}-tempo-service`, {
    metadata: {
      name: "tempo",
      namespace: namespace,
      labels: labels,
    },
    spec: {
      type: "ClusterIP",
      selector: {
        app: cfg.appName,
        component: "tempo",
      },
      ports: [
        { port: 3200, targetPort: 3200, name: "http" },
        { port: 4317, targetPort: 4317, name: "otlp-grpc" },
        { port: 4318, targetPort: 4318, name: "otlp-http" },
      ],
    },
  });

  return { deployment, service, configMap };
}
