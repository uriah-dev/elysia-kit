import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { InfraConfig, getCommonLabels } from "../config";

export interface PrometheusArgs {
    cfg: InfraConfig;
    namespace: pulumi.Input<string>;
}

/**
 * Create Prometheus deployment for metrics collection
 */
export function createPrometheus(args: PrometheusArgs) {
    const { cfg, namespace } = args;
    const labels = { ...getCommonLabels(cfg), component: "prometheus" };

    // Prometheus ConfigMap
    const configMap = new k8s.core.v1.ConfigMap(`${cfg.appName}-prometheus-config`, {
        metadata: {
            name: "prometheus-config",
            namespace: namespace,
            labels: labels,
        },
        data: {
            "prometheus.yml": `
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'elysia-kit'
    static_configs:
      - targets: ['${cfg.appName}:9464']
    metrics_path: /metrics

  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - ${cfg.namespace}
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: \$1:\$2
        target_label: __address__
`,
        },
    });

    // Prometheus Deployment
    const deployment = new k8s.apps.v1.Deployment(`${cfg.appName}-prometheus`, {
        metadata: {
            name: "prometheus",
            namespace: namespace,
            labels: labels,
        },
        spec: {
            replicas: 1,
            selector: {
                matchLabels: {
                    app: cfg.appName,
                    component: "prometheus",
                },
            },
            template: {
                metadata: {
                    labels: labels,
                },
                spec: {
                    containers: [
                        {
                            name: "prometheus",
                            image: "prom/prometheus:latest",
                            args: [
                                "--config.file=/etc/prometheus/prometheus.yml",
                                "--storage.tsdb.path=/prometheus",
                                "--web.enable-lifecycle",
                                "--enable-feature=exemplar-storage",
                            ],
                            ports: [{ containerPort: 9090, name: "http" }],
                            volumeMounts: [
                                {
                                    name: "config",
                                    mountPath: "/etc/prometheus",
                                },
                                {
                                    name: "data",
                                    mountPath: "/prometheus",
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
                        {
                            name: "data",
                            emptyDir: {},
                        },
                    ],
                },
            },
        },
    });

    // Prometheus Service
    const service = new k8s.core.v1.Service(`${cfg.appName}-prometheus-service`, {
        metadata: {
            name: "prometheus",
            namespace: namespace,
            labels: labels,
        },
        spec: {
            type: "ClusterIP",
            selector: {
                app: cfg.appName,
                component: "prometheus",
            },
            ports: [{ port: 9090, targetPort: 9090, name: "http" }],
        },
    });

    return { deployment, service, configMap };
}
