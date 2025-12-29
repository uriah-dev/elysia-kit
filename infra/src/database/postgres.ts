import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { InfraConfig, getCommonLabels, getSecrets } from "../config";

export interface PostgresArgs {
    cfg: InfraConfig;
    namespace: pulumi.Input<string>;
}

/**
 * Create PostgreSQL StatefulSet with PersistentVolumeClaim
 */
export function createPostgres(args: PostgresArgs) {
    const { cfg, namespace } = args;
    const labels = getCommonLabels(cfg);
    const dbLabels = { ...labels, component: "database" };
    const secrets = getSecrets();

    // PersistentVolumeClaim for PostgreSQL data
    const pvc = new k8s.core.v1.PersistentVolumeClaim(`${cfg.appName}-postgres-pvc`, {
        metadata: {
            name: "postgres-data",
            namespace: namespace,
            labels: dbLabels,
        },
        spec: {
            accessModes: ["ReadWriteOnce"],
            resources: {
                requests: {
                    storage: cfg.dbStorageSize,
                },
            },
            // Use default storage class (K3s uses local-path by default)
        },
    });

    // PostgreSQL Secret
    const postgresSecret = new k8s.core.v1.Secret(`${cfg.appName}-postgres-secret`, {
        metadata: {
            name: "postgres-secret",
            namespace: namespace,
            labels: dbLabels,
        },
        type: "Opaque",
        stringData: {
            POSTGRES_DB: cfg.dbName,
            POSTGRES_USER: cfg.dbUser,
            POSTGRES_PASSWORD: secrets.dbPassword || "change-me-in-production",
        },
    });

    // PostgreSQL StatefulSet
    const statefulSet = new k8s.apps.v1.StatefulSet(`${cfg.appName}-postgres`, {
        metadata: {
            name: "postgres",
            namespace: namespace,
            labels: dbLabels,
        },
        spec: {
            serviceName: "postgres",
            replicas: 1,
            selector: {
                matchLabels: {
                    app: cfg.appName,
                    component: "database",
                },
            },
            template: {
                metadata: {
                    labels: dbLabels,
                },
                spec: {
                    containers: [
                        {
                            name: "postgres",
                            image: "postgres:16-alpine",
                            ports: [
                                {
                                    name: "postgres",
                                    containerPort: 5432,
                                },
                            ],
                            envFrom: [
                                {
                                    secretRef: {
                                        name: postgresSecret.metadata.name,
                                    },
                                },
                            ],
                            volumeMounts: [
                                {
                                    name: "postgres-data",
                                    mountPath: "/var/lib/postgresql/data",
                                    subPath: "postgres",
                                },
                            ],
                            resources: {
                                requests: {
                                    cpu: cfg.environment === "production" ? "250m" : "100m",
                                    memory: cfg.environment === "production" ? "512Mi" : "256Mi",
                                },
                                limits: {
                                    cpu: cfg.environment === "production" ? "1" : "500m",
                                    memory: cfg.environment === "production" ? "1Gi" : "512Mi",
                                },
                            },
                            livenessProbe: {
                                exec: {
                                    command: ["pg_isready", "-U", cfg.dbUser],
                                },
                                initialDelaySeconds: 30,
                                periodSeconds: 10,
                            },
                            readinessProbe: {
                                exec: {
                                    command: ["pg_isready", "-U", cfg.dbUser],
                                },
                                initialDelaySeconds: 5,
                                periodSeconds: 5,
                            },
                        },
                    ],
                    volumes: [
                        {
                            name: "postgres-data",
                            persistentVolumeClaim: {
                                claimName: pvc.metadata.name,
                            },
                        },
                    ],
                },
            },
        },
    });

    // PostgreSQL Service
    const service = new k8s.core.v1.Service(`${cfg.appName}-postgres-service`, {
        metadata: {
            name: "postgres",
            namespace: namespace,
            labels: dbLabels,
        },
        spec: {
            type: "ClusterIP",
            selector: {
                app: cfg.appName,
                component: "database",
            },
            ports: [
                {
                    name: "postgres",
                    port: 5432,
                    targetPort: 5432,
                },
            ],
        },
    });

    return {
        statefulSet,
        service,
        pvc,
        secret: postgresSecret,
    };
}
