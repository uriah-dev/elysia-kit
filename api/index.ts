// Vercel serverless function entrypoint
// Note: Using relative imports to avoid path alias issues on Vercel
import { app } from "../src/app/_app";

export default app;
