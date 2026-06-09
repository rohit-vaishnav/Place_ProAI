import app from "./app.js";
import connectDatabase from "./config/database.js";
import env from "./config/env.js";
import logger from "./utils/logger.js";

async function start() {
  await connectDatabase();
  app.listen(env.port, "0.0.0.0", () => {
    logger.info(`PlacePro API running at http://localhost:${env.port}`);
  });
}

start().catch((err) => {
  logger.error("Failed to start server", err);
  process.exit(1);
});
