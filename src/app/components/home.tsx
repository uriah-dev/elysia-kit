import { env } from "@src/env";
import * as React from "react";

export const Home = () => {
    return (
        <html lang="en">
            <head>
                {/* @ts-expect-error - Type definition mismatch between React and detected environment */}
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Elysia Kit - Production-Ready Starter</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                {/* @ts-expect-error - Type definition mismatch between React and detected environment */}
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
                <style>
                    {`
            :root {
                --bg-color: #0B1120; /* Deep Slate/Black */
                --surface-color: rgba(30, 41, 59, 0.4); /* Slate 800 with opacity */
                --surface-border: rgba(148, 163, 184, 0.1);
                --text-primary: #F8FAFC; /* Slate 50 */
                --text-secondary: #94A3B8; /* Slate 400 */
                --accent-primary: #06b6d4; /* Cyan 500 */
                --accent-glow: rgba(6, 182, 212, 0.15);
                --gradient-start: #22d3ee; /* Cyan 400 */
                --gradient-end: #38bdf8; /* Sky 400 */
            }

            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background-color: var(--bg-color);
                background-image: 
                    radial-gradient(circle at 15% 50%, rgba(6, 182, 212, 0.08), transparent 25%), 
                    radial-gradient(circle at 85% 30%, rgba(56, 189, 248, 0.08), transparent 25%);
                color: var(--text-primary);
                min-height: 100vh;
                line-height: 1.6;
                overflow-x: hidden;
            }

            .container { 
                max-width: 1000px; 
                margin: 0 auto; 
                padding: 4rem 2rem;
            }

            /* Header Section */
            header {
                text-align: center;
                margin-bottom: 5rem;
                animation: fade-in 0.8s ease-out;
            }
            
            h1 {
                font-size: 3.5rem;
                font-weight: 800;
                letter-spacing: -0.05em;
                margin-bottom: 1rem;
                line-height: 1.2;
            }

            .gradient-text {
                background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .tagline { 
                color: var(--text-secondary); 
                font-size: 1.25rem; 
                margin-bottom: 2rem;
                max-width: 600px;
                margin-left: auto;
                margin-right: auto;
            }

            /* Badges */
            .badge-container {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 0.75rem;
                margin-bottom: 3rem;
            }

            .badge {
                display: inline-flex;
                align-items: center;
                background: rgba(6, 182, 212, 0.1);
                color: #22d3ee; /* Cyan 400 */
                padding: 0.35rem 1rem;
                border-radius: 9999px;
                font-size: 0.875rem;
                font-weight: 500;
                border: 1px solid rgba(6, 182, 212, 0.2);
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .badge:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px var(--accent-glow);
                background: rgba(6, 182, 212, 0.15);
            }

            /* Sections */
            .section { 
                margin-bottom: 4rem; 
            }
            
            .section h2 { 
                color: var(--text-primary); 
                margin-bottom: 2rem; 
                font-size: 1.5rem; 
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            
            .section h2::after {
                content: "";
                flex: 1;
                height: 1px;
                background: linear-gradient(90deg, var(--surface-border), transparent);
                margin-left: 1rem;
            }

            /* Feature Grid */
            .feature-grid { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
                gap: 1.5rem; 
            }
            
            .card {
                background: var(--surface-color);
                padding: 1.75rem;
                border-radius: 1rem;
                border: 1px solid var(--surface-border);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
            }
            
            .card:hover {
                transform: translateY(-4px);
                border-color: rgba(6, 182, 212, 0.3);
                box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
            }
            
            .card h3 { 
                color: #e2e8f0; /* Slate 200 */
                font-size: 1.125rem; 
                margin-bottom: 0.75rem; 
                font-weight: 600;
            }
            
            .card p { 
                font-size: 0.95rem; 
                color: var(--text-secondary);
                line-height: 1.6;
            }

            /* Code Block */
            .code-window {
                background: #0f172a; /* Slate 900 solid */
                border-radius: 0.75rem;
                overflow: hidden;
                border: 1px solid var(--surface-border);
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
            }
            
            .code-header {
                display: flex;
                gap: 6px;
                padding: 1rem;
                background: rgba(30, 41, 59, 0.5);
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            .dot { width: 10px; height: 10px; border-radius: 50%; }
            .red { background: #ef4444; }
            .yellow { background: #eab308; }
            .green { background: #22c55e; }

            pre {
                padding: 1.5rem;
                overflow-x: auto;
                font-family: 'JetBrains Mono', 'SF Mono', Monaco, monospace;
                font-size: 0.9rem;
                line-height: 1.6;
            }
            
            code { color: #e2e8f0; }
            .comment { color: #64748b; }
            .command { color: #22d3ee; }
            
            /* Links */
            .link-card {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: var(--surface-color);
                color: var(--text-primary);
                padding: 1rem 2rem;
                border-radius: 0.75rem;
                border: 1px solid var(--surface-border);
                text-decoration: none;
                font-weight: 500;
                transition: all 0.2s;
            }
            
            .link-card:hover {
                background: rgba(6, 182, 212, 0.1);
                color: #22d3ee;
                border-color: rgba(6, 182, 212, 0.3);
            }
            
            .links-container {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
            }

            /* Footer */
            footer {
                text-align: center;
                margin-top: 6rem;
                padding-top: 2rem;
                border-top: 1px solid var(--surface-border);
                color: #475569;
                font-size: 0.875rem;
            }
            
            @keyframes fade-in {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            @media (max-width: 640px) {
                h1 { font-size: 2.5rem; }
                .container { padding: 3rem 1.5rem; }
            }
          `}
                </style>
            </head>
            <body>
                <div className="container">
                    <header>
                        <h1><span className="gradient-text">Elysia Kit</span></h1>
                        <p className="tagline">
                            The production-ready scaffold for building high-performance APIs with ElysiaJS and Bun.
                        </p>

                        <div className="badge-container">
                            <span className="badge">ElysiaJS</span>
                            <span className="badge">Bun Runtime</span>
                            <span className="badge">TypeScript</span>
                            <span className="badge">Drizzle ORM</span>
                            <span className="badge">OpenTelemetry</span>
                        </div>
                    </header>

                    <div className="section">
                        <h2>✨ What's Included</h2>
                        <div className="feature-grid">
                            <div className="card">
                                <h3>🚀 Bun Runtime</h3>
                                <p>Lightning-fast JavaScript runtime with native TypeScript support, optimized for modern development.</p>
                            </div>
                            <div className="card">
                                <h3>🗄️ Drizzle ORM</h3>
                                <p>Type-safe database queries with PostgreSQL. Lightweight, performant, and developer-friendly.</p>
                            </div>
                            <div className="card">
                                <h3>📊 Full Observability</h3>
                                <p>Pre-configured stack with Prometheus, Grafana, Loki, and Tempo for complete system visibility.</p>
                            </div>
                            <div className="card">
                                <h3>🛡️ Arcjet Security</h3>
                                <p>Enterprise-grade security with bot protection, rate limiting, and WAF built directly into the framework.</p>
                            </div>
                            <div className="card">
                                <h3>📧 Email Ready</h3>
                                <p>Seamless email integration using Resend and React Email templates for beautiful communications.</p>
                            </div>
                            <div className="card">
                                <h3>⚡ Background Jobs</h3>
                                <p>Robust async task processing powered by Trigger.dev for reliable durability.</p>
                            </div>
                        </div>
                    </div>

                    <div className="section">
                        <h2>🚀 Deployment Ready</h2>
                        <div className="feature-grid">
                            <div className="card">
                                <h3>PM2 (VPS)</h3>
                                <p>Simple and cost-effective deployment starting at ~$5/mo using standard VPS providers.</p>
                            </div>
                            <div className="card">
                                <h3>Pulumi / K8s</h3>
                                <p>Scalable infrastructure as code for enterprise needs with auto-scaling and high availability.</p>
                            </div>
                        </div>
                    </div>

                    <div className="section">
                        <h2>📖 Quick Start</h2>
                        <div className="code-window">
                            <div className="code-header">
                                <span className="dot red"></span>
                                <span className="dot yellow"></span>
                                <span className="dot green"></span>
                            </div>
                            <pre>
                                <code>
                                    {`# Clone and install
`}<span className="command">git clone https://github.com/your-repo/elysia-kit.git</span>{`
`}<span className="command">cd elysia-kit && bun install</span>{`

# Setup database
`}<span className="command">bun run db:generate && bun run db:migrate</span>{`

# Start development
`}<span className="command">bun run dev</span>
                                </code>
                            </pre>
                        </div>
                    </div>

                    <div className="section">
                        <h2>🔗 Resources</h2>
                        <div className="links-container">
                            <a href={`${env.APP_URL}/openapi`} className="link-card">ElysiaKit OpenAPI</a>
                            <a href="https://elysiajs.com/at-glance.html" target="_blank" className="link-card">ElysiaJS Docs</a>
                            <a href="https://bun.sh/docs" target="_blank" className="link-card">Bun Docs</a>
                        </div>
                    </div>

                    <footer>
                        <p>Built with ❤️ using ElysiaJS + Bun</p>
                    </footer>
                </div>
            </body>
        </html>
    )
}
