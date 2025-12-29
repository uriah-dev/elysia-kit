import * as pulumi from "@pulumi/pulumi";
import { InfraConfig } from "../config";
import { createPrometheus } from "./prometheus";
import { createGrafana } from "./grafana";
import { createLoki } from "./loki";
import { createTempo } from "./tempo";
import { createGrafanaIngress } from "./grafana-ingress";

export interface ObservabilityArgs {
    cfg: InfraConfig;
    namespace: pulumi.Input<string>;
}

/**
 * Create the full observability stack (Prometheus, Grafana, Loki, Tempo)
 */
export function createObservabilityStack(args: ObservabilityArgs) {
    const { cfg, namespace } = args;

    if (!cfg.enableObservability) {
        return {
            prometheus: undefined,
            grafana: undefined,
            loki: undefined,
            tempo: undefined,
            grafanaIngress: undefined,
        };
    }

    const prometheus = createPrometheus({ cfg, namespace });
    const loki = createLoki({ cfg, namespace });
    const tempo = createTempo({ cfg, namespace });
    const grafana = createGrafana({ cfg, namespace });

    // Create Grafana Ingress for public access
    const grafanaIngress = createGrafanaIngress({
        cfg,
        namespace,
        serviceName: grafana.service.metadata.name,
        domain: "monitoring.steppy.dev",
    });

    return {
        prometheus,
        grafana,
        loki,
        tempo,
        grafanaIngress,
    };
}

export { createPrometheus } from "./prometheus";
export { createGrafana } from "./grafana";
export { createLoki } from "./loki";
export { createTempo } from "./tempo";
export { createGrafanaIngress } from "./grafana-ingress";
