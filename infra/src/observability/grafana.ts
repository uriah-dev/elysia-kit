import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { InfraConfig, getCommonLabels } from "../config";

export interface GrafanaArgs {
    cfg: InfraConfig;
    namespace: pulumi.Input<string>;
}

/**
 * Create Grafana deployment for visualization
 */
export function createGrafana(args: GrafanaArgs) {
    const { cfg, namespace } = args;
    const labels = { ...getCommonLabels(cfg), component: "grafana" };

    // Grafana datasource provisioning
    const datasourcesConfigMap = new k8s.core.v1.ConfigMap(`${cfg.appName}-grafana-datasources`, {
        metadata: {
            name: "grafana-datasources",
            namespace: namespace,
            labels: labels,
        },
        data: {
            "datasources.yaml": `
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false

  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    editable: false

  - name: Tempo
    type: tempo
    access: proxy
    url: http://tempo:3200
    editable: false
    jsonData:
      tracesToLogs:
        datasourceUid: loki
        tags: ['job', 'instance', 'pod', 'namespace']
        mappedTags: [{ key: 'service.name', value: 'service' }]
        mapTagNamesEnabled: false
        spanStartTimeShift: '1h'
        spanEndTimeShift: '-1h'
        filterByTraceID: false
        filterBySpanID: false
      serviceMap:
        datasourceUid: prometheus
      nodeGraph:
        enabled: true
`,
        },
    });

    // Grafana Deployment
    const deployment = new k8s.apps.v1.Deployment(`${cfg.appName}-grafana`, {
        metadata: {
            name: "grafana",
            namespace: namespace,
            labels: labels,
        },
        spec: {
            replicas: 1,
            selector: {
                matchLabels: {
                    app: cfg.appName,
                    component: "grafana",
                },
            },
            template: {
                metadata: {
                    labels: labels,
                },
                spec: {
                    containers: [
                        {
                            name: "grafana",
                            image: "grafana/grafana:latest",
                            ports: [{ containerPort: 3000, name: "http" }],
                            env: [
                                { name: "GF_AUTH_ANONYMOUS_ENABLED", value: "true" },
                                { name: "GF_AUTH_ANONYMOUS_ORG_ROLE", value: "Admin" },
                                { name: "GF_SERVER_ROOT_URL", value: "https://monitoring.steppy.dev" },
                            ],
                            volumeMounts: [
                                {
                                    name: "datasources",
                                    mountPath: "/etc/grafana/provisioning/datasources",
                                },
                            ],
                            resources: {
                                requests: { cpu: "100m", memory: "128Mi" },
                                limits: { cpu: "500m", memory: "256Mi" },
                            },
                        },
                    ],
                    volumes: [
                        {
                            name: "datasources",
                            configMap: { name: datasourcesConfigMap.metadata.name },
                        },
                    ],
                },
            },
        },
    });

    // Grafana Service
    const service = new k8s.core.v1.Service(`${cfg.appName}-grafana-service`, {
        metadata: {
            name: "grafana",
            namespace: namespace,
            labels: labels,
        },
        spec: {
            type: "ClusterIP",
            selector: {
                app: cfg.appName,
                component: "grafana",
            },
            ports: [{ port: 3000, targetPort: 3000, name: "http" }],
        },
    });

    return { deployment, service, datasourcesConfigMap };
}
