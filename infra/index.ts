import * as pulumi from "@pulumi/pulumi";
import { loadConfig, InfraConfig } from "./src/config";
import { createNamespace } from "./src/namespace";
import { createDeployment } from "./src/app/deployment";
import { createService } from "./src/app/service";
import { createIngress } from "./src/app/ingress";
import { createConfigMap } from "./src/app/configmap";
import { createSecrets } from "./src/app/secrets";
import { createPostgres } from "./src/database/postgres";
import { createObservabilityStack } from "./src/observability";
import { createCertManager } from "./src/cert-manager";

// Load environment-aware configuration
const cfg = loadConfig();

// ============================================================================
// Namespace
// ============================================================================
const namespace = createNamespace(cfg);
const namespaceName = namespace.metadata.name;

// ============================================================================
// cert-manager ClusterIssuer (for SSL/TLS)
// ============================================================================
const certManager = createCertManager({
    cfg,
    email: cfg.letsencryptEmail,
});

// ============================================================================
// Database
// ============================================================================
const postgres = createPostgres({ cfg, namespace: namespaceName });

// ============================================================================
// Application Configuration
// ============================================================================
const configMap = createConfigMap({ cfg, namespace: namespaceName });
const secrets = createSecrets({ cfg, namespace: namespaceName });

// ============================================================================
// Application
// ============================================================================
const deployment = createDeployment({
    cfg,
    namespace: namespaceName,
    configMapName: configMap.metadata.name,
    secretName: secrets.metadata.name,
});

const service = createService({ cfg, namespace: namespaceName });
const ingress = createIngress({
    cfg,
    namespace: namespaceName,
    serviceName: service.metadata.name,
});

// ============================================================================
// Observability Stack
// ============================================================================
const observability = createObservabilityStack({ cfg, namespace: namespaceName });

// ============================================================================
// Exports
// ============================================================================
export const environment = cfg.environment;
export const appNamespace = namespace.metadata.name;
export const appUrl = pulumi.interpolate`https://${cfg.domain}`;
export const appServiceName = service.metadata.name;
export const postgresServiceName = postgres.service.metadata.name;

// Observability URLs (internal)
export const prometheusUrl = cfg.enableObservability
    ? pulumi.interpolate`http://prometheus.${namespaceName}:9090`
    : undefined;
export const grafanaUrl = cfg.enableObservability
    ? pulumi.interpolate`http://grafana.${namespaceName}:3000`
    : undefined;
export const lokiUrl = cfg.enableObservability
    ? pulumi.interpolate`http://loki.${namespaceName}:3100`
    : undefined;
export const tempoUrl = cfg.enableObservability
    ? pulumi.interpolate`http://tempo.${namespaceName}:3200`
    : undefined;
