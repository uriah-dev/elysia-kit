import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { InfraConfig, getCommonLabels } from "../config";

export interface LokiArgs {
    cfg: InfraConfig;
    namespace: pulumi.Input<string>;
}

/**
 * Create Loki deployment for log aggregation
 */
export function createLoki(args: LokiArgs) {
    const { cfg, namespace } = args;
    const labels = { ...getCommonLabels(cfg), component: "loki" };

    // Loki Deployment
    const deployment = new k8s.apps.v1.Deployment(`${cfg.appName}-loki`, {
        metadata: {
            name: "loki",
            namespace: namespace,
            labels: labels,
        },
        spec: {
            replicas: 1,
            selector: {
                matchLabels: {
                    app: cfg.appName,
                    component: "loki",
                },
            },
            template: {
                metadata: {
                    labels: labels,
                },
                spec: {
                    containers: [
                        {
                            name: "loki",
                            image: "grafana/loki:latest",
                            args: ["-config.file=/etc/loki/local-config.yaml"],
                            ports: [{ containerPort: 3100, name: "http" }],
                            resources: {
                                requests: { cpu: "100m", memory: "128Mi" },
                                limits: { cpu: "500m", memory: "256Mi" },
                            },
                        },
                    ],
                },
            },
        },
    });

    // Loki Service
    const service = new k8s.core.v1.Service(`${cfg.appName}-loki-service`, {
        metadata: {
            name: "loki",
            namespace: namespace,
            labels: labels,
        },
        spec: {
            type: "ClusterIP",
            selector: {
                app: cfg.appName,
                component: "loki",
            },
            ports: [{ port: 3100, targetPort: 3100, name: "http" }],
        },
    });

    return { deployment, service };
}
