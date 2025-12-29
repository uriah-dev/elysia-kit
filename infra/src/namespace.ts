import * as k8s from "@pulumi/kubernetes";
import { InfraConfig, getCommonLabels } from "./config";

/**
 * Create a Kubernetes namespace for the environment
 */
export function createNamespace(cfg: InfraConfig) {
    const namespace = new k8s.core.v1.Namespace(`${cfg.appName}-namespace`, {
        metadata: {
            name: cfg.namespace,
            labels: getCommonLabels(cfg),
        },
    });

    return namespace;
}
