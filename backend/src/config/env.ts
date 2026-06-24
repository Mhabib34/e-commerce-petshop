const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET", "PORT"] as const;

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  DATABASE_URL: process.env["DATABASE_URL"]!,
  JWT_SECRET: process.env["JWT_SECRET"]!,
  PORT: parseInt(process.env["PORT"]!, 10),
  NODE_ENV: process.env["NODE_ENV"] ?? "development",
};