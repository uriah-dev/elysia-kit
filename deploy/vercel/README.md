# Vercel Deployment

Deploy elysia-kit to Vercel as a serverless function using Bun runtime.

## Prerequisites

1. A Vercel account at [vercel.com](https://vercel.com)
2. Your repository pushed to GitHub, GitLab, or Bitbucket

## Option 1: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Vercel auto-detects the Bun runtime from `vercel.json`
4. Add your environment variables (see below)
5. Click **Deploy**

> **Tip**: Future pushes to your main branch will auto-deploy.

## Option 2: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Local development
bun run vercel:dev

# Deploy to preview
bun run vercel:deploy

# Deploy to production
bun run vercel:deploy:prod
```

## How It Works

Vercel automatically discovers the `src/index.ts` file, which exports the Elysia
server as the default export. The `vercel.json` configures Bun as the runtime.

### Key Files

| File           | Purpose                            |
| -------------- | ---------------------------------- |
| `src/index.ts` | Serverless function entry point    |
| `vercel.json`  | Vercel configuration (Bun runtime) |

## Environment Variables

Set environment variables in the Vercel dashboard or via CLI:

```bash
vc env add DATABASE_URL
vc env add APP_URL
vc env add APP_NAME
# ... add other required variables
```

Required variables (see `.env.example`):

- `DATABASE_URL` – PostgreSQL connection string
- `APP_URL` – Your Vercel deployment URL
- `APP_NAME` – Application name

## Limitations

> **Note**: Serverless functions have execution time limits (10-60s depending on
> plan). Run long-running background jobs via Trigger.dev.

## Comparison with Other Methods

| Aspect          | Vercel              | PM2      | Pulumi/K8s  |
| --------------- | ------------------- | -------- | ----------- |
| **Setup**       | Instant             | ~30 min  | ~2 hours    |
| **Cost**        | Free tier available | $5-20/mo | $20-100+/mo |
| **Scaling**     | Automatic           | Manual   | Automatic   |
| **Cold Starts** | Yes                 | No       | No          |

## Troubleshooting

### Build Errors

Ensure all dependencies are listed in `package.json`. Vercel uses `bun install`
by default.

### Missing Peer Dependencies (pnpm users)

If using pnpm, manually install peer deps:

```bash
pnpm add @sinclair/typebox openapi-types
```

## Configuration

To ensure successful deployment, check your configuration files:

### 1. `package.json`

Your project must be treated as an ES Module for node runtime

```json
{
    "type": "module"
}
```

### 2. `vercel.json`

Configure rewriting to the entrypoint and Bun version.

```json
{
    "$schema": "https://openapi.vercel.sh/vercel.json",
    "bunVersion": "1.x"
}
```

## Troubleshooting

**Cause:** Running `vc` with an incorrect `--cwd` (e.g., `--cwd deploy`) or
deploying from a subdirectory when the config expects root. **Fix:** Run
`vc deploy` from the project root.

### Additional Help

Refer to
[Vercel Elysia Documentation](https://vercel.com/docs/frameworks/backend/elysia)
