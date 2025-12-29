import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { InfraConfig, getCommonLabels } from "./config";

export interface CertManagerArgs {
    cfg: InfraConfig;
    email: string;
}

/**
 * Create Let's Encrypt ClusterIssuer for automatic SSL certificates
 */
export function createCertManager(args: CertManagerArgs) {
    const { cfg, email } = args;
    const labels = getCommonLabels(cfg);

    // Let's Encrypt production issuer
    const letsencryptProd = new k8s.apiextensions.CustomResource(
        `${cfg.appName}-letsencrypt-prod`,
        {
            apiVersion: "cert-manager.io/v1",
            kind: "ClusterIssuer",
            metadata: {
                name: "letsencrypt-prod",
                labels: labels,
            },
            spec: {
                acme: {
                    server: "https://acme-v02.api.letsencrypt.org/directory",
                    email: email,
                    privateKeySecretRef: {
                        name: "letsencrypt-prod",
                    },
                    solvers: [
                        {
                            http01: {
                                ingress: {
                                    class: "traefik",
                                },
                            },
                        },
                    ],
                },
            },
        }
    );

    // Let's Encrypt staging issuer (for testing)
    const letsencryptStaging = new k8s.apiextensions.CustomResource(
        `${cfg.appName}-letsencrypt-staging`,
        {
            apiVersion: "cert-manager.io/v1",
            kind: "ClusterIssuer",
            metadata: {
                name: "letsencrypt-staging",
                labels: labels,
            },
            spec: {
                acme: {
                    server: "https://acme-staging-v02.api.letsencrypt.org/directory",
                    email: email,
                    privateKeySecretRef: {
                        name: "letsencrypt-staging",
                    },
                    solvers: [
                        {
                            http01: {
                                ingress: {
                                    class: "traefik",
                                },
                            },
                        },
                    ],
                },
            },
        }
    );

    return {
        letsencryptProd,
        letsencryptStaging,
    };
}
