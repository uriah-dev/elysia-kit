import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { InfraConfig, getCommonLabels } from "../config";

export interface GrafanaIngressArgs {
    cfg: InfraConfig;
    namespace: pulumi.Input<string>;
    serviceName: pulumi.Input<string>;
    domain: string;
}

/**
 * Create Ingress for Grafana with SSL
 */
export function createGrafanaIngress(args: GrafanaIngressArgs) {
    const { cfg, namespace, serviceName, domain } = args;
    const labels = { ...getCommonLabels(cfg), component: "grafana" };

    const ingress = new k8s.networking.v1.Ingress(`${cfg.appName}-grafana-ingress`, {
        metadata: {
            name: "grafana",
            namespace: namespace,
            labels: labels,
            annotations: {
                "kubernetes.io/ingress.class": "traefik",
                "cert-manager.io/cluster-issuer": "letsencrypt-prod",
            },
        },
        spec: {
            rules: [
                {
                    host: domain,
                    http: {
                        paths: [
                            {
                                path: "/",
                                pathType: "Prefix",
                                backend: {
                                    service: {
                                        name: serviceName,
                                        port: {
                                            number: 3000,
                                        },
                                    },
                                },
                            },
                        ],
                    },
                },
            ],
            tls: [
                {
                    hosts: [domain],
                    secretName: "grafana-tls",
                },
            ],
        },
    });

    return ingress;
}
