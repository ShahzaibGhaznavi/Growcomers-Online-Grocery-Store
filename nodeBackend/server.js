
const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
require("dotenv").config();

const db = require("./utils/db");
const blockchain = require("./utils/listenBlockchain");
const passportSetup = require("./utils/passport");

app.use(express());
app.use(express.json());
app.use(cookieParser());

// Allow the configured frontend origin(s).
// Local development defaults to localhost:3000.
const allowedOrigins = (
  process.env.FRONTEND_URL || "http://localhost:3000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Requests without an Origin header are allowed
      // (for example, curl or server-to-server requests).
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: true,
    // For HTTPS production deployments, configure secure cookies
    // and sameSite according to your authentication setup.
  })
);

app.set("trust proxy", 1);

app.use(passport.initialize());
app.use(passport.session());

app.use("/contracts", express.static("blockchain/build"));

const addressRouter = require("./routes/addressRoute");
const authRouter = require("./routes/authRoute");
const brandRouter = require("./routes/brandRoute");
const cartRouter = require("./routes/cartRoute");
const categoryRouter = require("./routes/categoryRoute");
const googleAuthRouter = require("./routes/googleAuthRoute");
const orderRouter = require("./routes/orderRoute");
const paymentRouter = require("./routes/paymentRoute");
const productRouter = require("./routes/productRoute");
const reviewRouter = require("./routes/reviewRoute");
const wishlistRouter = require("./routes/wishlistRoute");
const rateRouter = require("./routes/rateRoute");

app.use("/address", addressRouter);
app.use("/auth", authRouter);
app.use("/brand", brandRouter);
app.use("/cart", cartRouter);
app.use("/category", categoryRouter);
app.use("/google", googleAuthRouter);
app.use("/order", orderRouter);
app.use("/payment", paymentRouter);
app.use("/product", productRouter);
app.use("/review", reviewRouter);
app.use("/wishlist", wishlistRouter);
app.use("/rate", rateRouter);

app.get("/", (req, res) => {
  res.send("GROWCOMERS - Backend is running!!!");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port:- ${PORT}`);
});
