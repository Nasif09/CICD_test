const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const routes = require("./routes");
const morgan = require("morgan");
const logger = require("./helpers/logger");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
require("dotenv").config();

const app = express();

// 1. Dynamic CORS Middleware
app.use(cors({
  origin: function (origin, callback) {
    callback(null, origin); // Reflects origin dynamically
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Access-Control-Allow-Headers", "Content-Type", "Authorization", "signuptoken", "forget-password", "Forget-password"],
  // allowedHeaders: ["Content-Type", "Authorization", "signuptoken", "forget-password"],
}));

// 2. Serve static files with dynamic CORS headers
app.use(express.static("public", {
  setHeaders: (res, path, stat) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
}));

// 3. Security headers
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// 4. Session config
app.use(session({ secret: 'realestate', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// 5. Body parsers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 6. Logging
const morganFormat = ":method :url :status :response-time ms";
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => {
      const logObject = {
        method: message.split(" ")[0],
        url: message.split(" ")[1],
        status: message.split(" ")[2],
        responseTime: message.split(" ")[3].replace("ms", "").trim(),
      };
      logger.log({
        level: "info",
        message: "Response time log",
        ...logObject,
        label: "ResponseTime",
      });
    },
  },
}));

// 7. Routes
app.use("/api/v1", routes);

// 8. Dev Login Page for internal usage
const { logViewer } = require("./helpers/logViewer");
const { getDevLoginPage } = require("./helpers/logViewerLogin");

app.get("/dev-login", (req, res) => {
  res.send(getDevLoginPage());
});

app.post("/dev-login", (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.MONITOR_USERNAME && password === process.env.MONITOR_PASSWORD) {
    req.session.isDev = true;
    return res.redirect("/");
  }
  res.send(`
    <p style="color: red; text-align: center; margin-top: 50px;">Invalid credentials</p>
    <script>setTimeout(() => window.location.href = "/dev-login", 2000);</script>
  `);
});

const requireDevLogin = (req, res, next) => {
  if (req.session.isDev) return next();
  res.redirect("/dev-login");
};

app.get("/", requireDevLogin, logViewer);

// 9. Error Handlers
const {
  notFoundHandler,
  errorHandler,
  errorConverter,
} = require("./middlewares/errorHandler");

app.use(notFoundHandler);
app.use(errorConverter);
app.use(errorHandler);

module.exports = app;
