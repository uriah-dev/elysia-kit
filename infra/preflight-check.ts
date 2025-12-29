/**
 * Preflight validation checks for Pulumi configuration
 * 
 * Run this before deployment to ensure all required configuration is set correctly.
 * 
 * Usage:
 *   bun run infra/preflight-check.ts
 */

import * as pulumi from "@pulumi/pulumi";

interface Check {
    name: string;
    check: () => { pass: boolean; message?: string };
}

const config = new pulumi.Config();
const stack = pulumi.getStack();

const checks: Check[] = [
    {
        name: "Image Registry",
        check: () => {
            try {
                const registry = config.require("imageRegistry");
                if (registry.includes("your-username") || registry.includes("change-me")) {
                    return {
                        pass: false,
                        message: `❌ imageRegistry contains placeholder value: ${registry}\n   Fix: pulumi config set imageRegistry docker.io/YOUR_USERNAME`
                    };
                }
                return { pass: true };
            } catch (e) {
                return {
                    pass: false,
                    message: "❌ imageRegistry is not set\n   Fix: pulumi config set imageRegistry docker.io/YOUR_USERNAME"
                };
            }
        }
    },
    {
        name: "Domain",
        check: () => {
            try {
                const domain = config.require("domain");
                if (domain.includes("local") || domain.includes("example")) {
                    return {
                        pass: false,
                        message: `❌ domain contains placeholder value: ${domain}\n   Fix: pulumi config set domain yourdomain.com`
                    };
                }
                return { pass: true };
            } catch (e) {
                return {
                    pass: false,
                    message: "❌ domain is not set\n   Fix: pulumi config set domain yourdomain.com"
                };
            }
        }
    },
    {
        name: "Let's Encrypt Email",
        check: () => {
            try {
                const email = config.require("letsencryptEmail");
                if (email.includes("example.com") || email.includes("admin@")) {
                    return {
                        pass: false,
                        message: `❌ letsencryptEmail contains placeholder value: ${email}\n   Fix: pulumi config set letsencryptEmail you@yourdomain.com`
                    };
                }
                // Basic email validation
                if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                    return {
                        pass: false,
                        message: `❌ letsencryptEmail is not a valid email: ${email}\n   Fix: pulumi config set letsencryptEmail you@yourdomain.com`
                    };
                }
                return { pass: true };
            } catch (e) {
                return {
                    pass: false,
                    message: "❌ letsencryptEmail is not set\n   Fix: pulumi config set letsencryptEmail you@yourdomain.com"
                };
            }
        }
    },
    {
        name: "Database Password",
        check: () => {
            try {
                config.getSecret("dbPassword");
                return { pass: true };
            } catch (e) {
                return {
                    pass: false,
                    message: "⚠️  dbPassword is not set (recommended for production)\n   Fix: pulumi config set --secret dbPassword YOUR_SECURE_PASSWORD"
                };
            }
        }
    },
    {
        name: "Resend API Key",
        check: () => {
            try {
                config.getSecret("resendApiKey");
                return { pass: true };
            } catch (e) {
                return {
                    pass: false,
                    message: "⚠️  resendApiKey is not set (required for email functionality)\n   Fix: pulumi config set --secret resendApiKey re_XXXXX"
                };
            }
        }
    }
];

export function runPreflightChecks() {
    console.log(`\n🔍 Running preflight checks for stack: ${stack}\n`);
    console.log("=".repeat(60));

    const failures: string[] = [];
    const warnings: string[] = [];
    let passed = 0;

    for (const check of checks) {
        const result = check.check();
        if (result.pass) {
            console.log(`✅ ${check.name}`);
            passed++;
        } else {
            // Check if it's a warning (starts with ⚠️) or error (starts with ❌)
            if (result.message?.startsWith("⚠️")) {
                warnings.push(result.message);
            } else {
                failures.push(result.message!);
            }
        }
    }

    console.log("=".repeat(60));

    if (failures.length > 0) {
        console.log("\n❌ CRITICAL CONFIGURATION ERRORS:\n");
        failures.forEach(msg => console.log(msg + "\n"));
        console.log("Fix these errors before deploying.\n");
        process.exit(1);
    }

    if (warnings.length > 0) {
        console.log("\n⚠️  Configuration Warnings:\n");
        warnings.forEach(msg => console.log(msg + "\n"));
    }

    console.log(`\n✅ Preflight checks passed! (${passed}/${checks.length} checks OK)\n`);

    if (warnings.length > 0) {
        console.log("Note: Some optional configurations are missing (see warnings above).\n");
    }
}

// Run checks if this file is executed directly
const isMainModule = process.argv[1]?.includes('preflight-check');
if (isMainModule) {
    runPreflightChecks();
}
