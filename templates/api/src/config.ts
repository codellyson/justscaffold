/**
 * Config is read once at boot and validated eagerly, so a missing or
 * malformed variable fails at startup rather than on the first request that
 * happens to need it.
 */
export interface Config {
  port: number;
  nodeEnv: "development" | "production" | "test";
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const port = Number(env.PORT ?? 3000);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`PORT must be a valid port number, got "${env.PORT}"`);
  }

  const nodeEnv = (env.NODE_ENV ?? "development") as Config["nodeEnv"];

  return { port, nodeEnv };
}
