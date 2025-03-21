const app = require("./app");
const config = require("./config");
const logger = require("./utils/logger");

const PORT = config.port || 3000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
