import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/bun";
import { env } from "@src/env";

export const aj = env.ARCJET_KEY
    ? arcjet({
        key: env.ARCJET_KEY,
        characteristics: ["ip.src"],
        rules: [
            shield({ mode: env.ARCJET_ENV === "production" ? "LIVE" : "DRY_RUN" }),
            detectBot({
                mode: "LIVE",
                allow: [
                    "CATEGORY:SEARCH_ENGINE",
                    "CATEGORY:MONITOR",
                    "CATEGORY:PREVIEW",
                ],
            }),
            tokenBucket({
                mode: "LIVE",
                refillRate: 10,
                interval: 60,
                capacity: 100,
            }),
        ],
    })
    : null;

export type ArcjetDecision = Awaited<
    ReturnType<NonNullable<typeof aj>["protect"]>
>;

type SetType = { status?: number | string };

export const arcjetProtect = async (request: Request, set: SetType) => {
    if (!aj) return;

    const decision = await aj.protect(request, { requested: 1 });
    if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
            set.status = 429;
            return {
                error: "Too Many Requests",
                retryAfter: decision.reason.resetTime,
            };
        }
        if (decision.reason.isBot()) {
            set.status = 403;
            return { error: "Bot detected" };
        }
        set.status = 403;
        return { error: "Forbidden" };
    }
};