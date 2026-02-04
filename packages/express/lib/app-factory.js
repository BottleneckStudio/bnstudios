"use strict";

const helmet = require("helmet");
const compression = require("compression");

module.exports = Object.freeze({
  createApp: (express) => {
    const app = express();

    app.disable("x-powered-by");

    app.use(helmet());
    app.use(compression());
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    return app;
  },
});
