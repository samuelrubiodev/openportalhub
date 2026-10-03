/**
 * Thin entrypoint for the waitlist API container (Dockerfile.api runs
 * `bun apps/openportalhub/server/index.ts` from the monorepo root). All logic
 * lives in @openportalhub/waitlist; this file only loads the environment and
 * starts the service.
 */
import { createWaitlistApi, loadEnv } from "@openportalhub/waitlist";

createWaitlistApi(loadEnv()).start();
