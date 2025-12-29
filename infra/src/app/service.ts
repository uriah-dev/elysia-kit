import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { InfraConfig, getCommonLabels } from "../config";

export interface ServiceArgs {
    cfg: InfraConfig;
    namespace: pulumi.Input<string>;
}

/**
 * Create the Kubernetes Service for the application
 */
export function createService(args: ServiceArgs) {
    const { cfg, namespace } = args;
    const labels = getCommonLabels(cfg);

    const service = new k8s.core.v1.Service(`${cfg.appName}-service`, {
        metadata: {
            name: cfg.appName,
            namespace: namespace,
            labels: labels,
        },
        spec: {
            // Use ClusterIP for both environments - Ingress handles external access
            type: "ClusterIP",
            selector: {
                app: cfg.appName,
                component: "app",
            },
            ports: [
                {
                    name: "http",
                    port: 80,
                    targetPort: cfg.appPort,
                    protocol: "TCP",
                },
            ],
        },
    });

    return service;
}
