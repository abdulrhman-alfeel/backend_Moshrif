const rateLimit = require("express-rate-limit");
const logEvents = require("./logger");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  // standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  handler: (req, res, next, options) => {
    logEvents(
      `Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
      "errLog.log"
    );
    res.status(options.statusCode).send(options.message);
  },
keyGenerator: (req) => {
    // Use the client's real IP, even if trust proxy is enabled
    return req.ip; // Or custom logic to get the IP
  },
  // legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  headers: false, // Disable the `X-RateLimit-*` headers.
});

module.exports = limiter;



