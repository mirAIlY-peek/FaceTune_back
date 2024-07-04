const pino = require('pino');
const logger = pino();

const DEFAULT_MODEL = "chirp-v3-5";

const sleep = (x, y) => {
    let timeout = x * 1000;
    if (y !== undefined && y !== x) {
        const min = Math.min(x, y);
        const max = Math.max(x, y);
        timeout = Math.floor(Math.random() * (max - min + 1) + min) * 1000;
    }
    logger.info(`Sleeping for ${timeout / 1000} seconds`);
    return new Promise(resolve => setTimeout(resolve, timeout));
};

module.exports = {
    DEFAULT_MODEL,
    sleep
};
