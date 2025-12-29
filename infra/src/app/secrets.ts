import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { InfraConfig, getCommonLabels, getSecrets } from "../config";

export interface SecretsArgs {
    cfg: InfraConfig;
    namespace: pulumi.Input<string>;
}

/**
 * Create Secret for sensitive configuration
 * Values should be set via: pulumi config set --secret <key> <value>
 */
export function createSecrets(args: SecretsArgs) {
    const { cfg, namespace } = args;
    const labels = getCommonLabels(cfg);
    const secrets = getSecrets();

    const secretResource = new k8s.core.v1.Secret(`${cfg.appName}-secret`, {
        metadata: {
            name: `${cfg.appName}-secrets`,
            namespace: namespace,
            labels: labels,
        },
        type: "Opaque",
        stringData: {
            // Database
            DATABASE_URL: secrets.databaseUrl || pulumi.interpolate`postgresql://${cfg.dbUser}:${secrets.dbPassword}@postgres:5432/${cfg.dbName}`,

            // Email (Resend)
            RESEND_API_KEY: secrets.resendApiKey || "",
            RESEND_MAIL: secrets.resendMail || "",

            // Trigger.dev
            TRIGGER_SECRET_KEY: secrets.triggerSecretKey || "",
            TRIGGER_PROJECT_ID: secrets.triggerProjectId || "",
        },
    });

    return secretResource;
}
