import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { InfraConfig, getCommonLabels } from "../config";

export interface IngressArgs {
    cfg: InfraConfig;
    namespace: pulumi.Input<string>;
    serviceName: pulumi.Input<string>;
}

/**
 * Create the Kubernetes Ingress for external access
 * Designed for K3s with Traefik ingress controller
 */
export function createIngress(args: IngressArgs) {
    const { cfg, namespace, serviceName } = args;
    const labels = getCommonLabels(cfg);

    const ingress = new k8s.networking.v1.Ingress(`${cfg.appName}-ingress`, {
        metadata: {
            name: cfg.appName,
            namespace: namespace,
            labels: labels,
            annotations: {
                // Traefik annotations (default ingress controller in K3s)
                "kubernetes.io/ingress.class": "traefik",
                // cert-manager annotations for automatic SSL - always use production for trusted certs
                "cert-manager.io/cluster-issuer": "letsencrypt-prod",
            },
        },
        spec: {
            rules: [
                {
                    host: cfg.domain,
                    http: {
                        paths: [
                            {
                                path: "/",
                                pathType: "Prefix",
                                backend: {
                                    service: {
                                        name: serviceName,
                                        port: {
                                            number: 80,
                                        },
                                    },
                                },
                            },
                        ],
                    },
                },
            ],
            // TLS configuration with cert-manager
            tls: [
                {
                    hosts: [cfg.domain],
                    secretName: `${cfg.appName}-tls`,
                },
            ],
        },
    });

    return ingress;
}
