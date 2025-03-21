const info = (message) => {
  console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
};

const error = (message) => {
  console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
};

const warn = (message) => {
  console.warn(`[WARN] ${new Date().toISOString()}: ${message}`);
};

const debug = (message) => {
  if (process.env.NODE_ENV === "development") {
    console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`);
  }
};

module.exports = {
  info,
  error,
  warn,
  debug,
};
