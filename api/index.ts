import { createApp } from "../src/createApp";
import { config, logger } from "../src/config";

const app = createApp();

app.listen(config.port, () => {
  logger.info(`Running on Port ${config.port}`);
});
