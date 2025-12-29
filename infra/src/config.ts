import * as pulumi from "@pulumi/pulumi";

// Get the current stack name (dev or production)
const stack = pulumi.getStack();

// Create a config instance for this project
const config = new pulumi.Config();

/**
 * Environment-aware configuration for the elysia-kit infrastructure
 */
export interface InfraConfig {
    // Environment
    environment: "dev" | "production";

    // Application
    appName: string;
    namespace: string;
    replicas: number;
    imageTag: string;
    imageRegistry: string;
    appPort: number;
    logLevel: string;
    domain: string;

    // Database
    dbName: string;
    dbUser: string;
    dbStorageSize: string;

    // Resources
    cpuRequest: string;
    cpuLimit: string;
    memoryRequest: string;
    memoryLimit: string;

    // Observability
    enableObservability: boolean;

    // Telemetry ports
    prometheusPort: number;
    grafanaPort: number;
    lokiPort: number;
    tempoPort: number;

    // SSL/TLS
    letsencryptEmail: string;
}

/**
 * Load configuration with environment-aware defaults
 */
export function loadConfig(): InfraConfig {
    const environment = config.get("environment") || stack;
    const isProduction = environment === "production";

    return {
        // Environment
        environment: isProduction ? "production" : "dev",

        // Application
        appName: "elysia-kit",
        namespace: `elysia-kit-${environment}`,
        replicas: config.getNumber("replicas") || (isProduction ? 3 : 1),
        imageTag: config.get("imageTag") || "latest",
        imageRegistry: config.get("imageRegistry") || "docker.io/your-username",
        appPort: config.getNumber("appPort") || 3000,
        logLevel: config.get("logLevel") || (isProduction ? "info" : "debug"),
        domain: config.get("domain") || `${environment}.elysia-kit.local`,

        // Database
        dbName: config.get("dbName") || `elysia_kit_${environment}`,
        dbUser: config.get("dbUser") || "postgres",
        dbStorageSize: config.get("dbStorageSize") || (isProduction ? "20Gi" : "5Gi"),

        // Resources
        cpuRequest: config.get("cpuRequest") || (isProduction ? "250m" : "100m"),
        cpuLimit: config.get("cpuLimit") || (isProduction ? "1" : "500m"),
        memoryRequest: config.get("memoryRequest") || (isProduction ? "512Mi" : "256Mi"),
        memoryLimit: config.get("memoryLimit") || (isProduction ? "1Gi" : "512Mi"),

        // Observability
        enableObservability: config.getBoolean("enableObservability") ?? true,

        // Telemetry ports
        prometheusPort: 9090,
        grafanaPort: 3000,
        lokiPort: 3100,
        tempoPort: 3200,

        // SSL/TLS
        letsencryptEmail: config.get("letsencryptEmail") || "admin@example.com",
    };
}

/**
 * Common labels for all resources
 */
export function getCommonLabels(cfg: InfraConfig) {
    return {
        app: cfg.appName,
        environment: cfg.environment,
        "app.kubernetes.io/name": cfg.appName,
        "app.kubernetes.io/instance": `${cfg.appName}-${cfg.environment}`,
        "app.kubernetes.io/managed-by": "pulumi",
    };
}

/**
 * Get secrets from Pulumi config (must be set via `pulumi config set --secret`)
 */
export function getSecrets() {
    const secrets = new pulumi.Config();

    return {
        databaseUrl: secrets.getSecret("databaseUrl"),
        dbPassword: secrets.getSecret("dbPassword"),
        resendApiKey: secrets.getSecret("resendApiKey"),
        resendMail: secrets.get("resendMail"),
        triggerSecretKey: secrets.getSecret("triggerSecretKey"),
        triggerProjectId: secrets.get("triggerProjectId"),
    };
}
