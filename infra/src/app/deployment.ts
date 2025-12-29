import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { InfraConfig, getCommonLabels } from "../config";

export interface DeploymentArgs {
    cfg: InfraConfig;
    namespace: pulumi.Input<string>;
    configMapName: pulumi.Input<string>;
    secretName: pulumi.Input<string>;
}

/**
 * Create the main application Deployment
 */
export function createDeployment(args: DeploymentArgs) {
    const { cfg, namespace, configMapName, secretName } = args;
    const labels = getCommonLabels(cfg);
    const appLabels = { ...labels, component: "app" };

    const deployment = new k8s.apps.v1.Deployment(`${cfg.appName}-deployment`, {
        metadata: {
            name: cfg.appName,
            namespace: namespace,
            labels: appLabels,
        },
        spec: {
            replicas: cfg.replicas,
            selector: {
                matchLabels: {
                    app: cfg.appName,
                    component: "app",
                },
            },
            template: {
                metadata: {
                    labels: appLabels,
                },
                spec: {
                    containers: [
                        {
                            name: cfg.appName,
                            image: `${cfg.imageRegistry}/${cfg.appName}:${cfg.imageTag}`,
                            imagePullPolicy: cfg.environment === "production" ? "Always" : "IfNotPresent",
                            ports: [
                                {
                                    name: "http",
                                    containerPort: cfg.appPort,
                                    protocol: "TCP",
                                },
                            ],
                            envFrom: [
                                {
                                    configMapRef: {
                                        name: configMapName,
                                    },
                                },
                                {
                                    secretRef: {
                                        name: secretName,
                                    },
                                },
                            ],
                            resources: {
                                requests: {
                                    cpu: cfg.cpuRequest,
                                    memory: cfg.memoryRequest,
                                },
                                limits: {
                                    cpu: cfg.cpuLimit,
                                    memory: cfg.memoryLimit,
                                },
                            },
                            livenessProbe: {
                                httpGet: {
                                    path: "/health",
                                    port: cfg.appPort,
                                },
                                initialDelaySeconds: 15,
                                periodSeconds: 20,
                                timeoutSeconds: 5,
                                failureThreshold: 3,
                            },
                            readinessProbe: {
                                httpGet: {
                                    path: "/health",
                                    port: cfg.appPort,
                                },
                                initialDelaySeconds: 5,
                                periodSeconds: 10,
                                timeoutSeconds: 3,
                                failureThreshold: 3,
                            },
                        },
                    ],
                    restartPolicy: "Always",
                },
            },
            strategy: {
                type: "RollingUpdate",
                rollingUpdate: {
                    maxSurge: 1,
                    maxUnavailable: 0,
                },
            },
        },
    });

    return deployment;
}
