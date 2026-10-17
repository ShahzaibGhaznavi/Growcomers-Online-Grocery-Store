const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;

const userModel = require("../models/userModel");
const { generateToken } = require("../middlewares/generateToken");

require("dotenv").config();

if (
  process.env.GOOGLE_CLIENTID &&
  process.env.GOOGLE_CLIENTSECRET &&
  process.env.GOOGLE_CALLBACKURL
) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENTID,
        clientSecret: process.env.GOOGLE_CLIENTSECRET,
        callbackURL: process.env.GOOGLE_CALLBACKURL,
      },
      async function (accessToken, refreshToken, profile, done) {
        try {
          const email = profile.email;
          const name = profile.displayName;

          let userData = await userModel.findOne({ email: email });

          if (!userData) {
            userData = await userModel.create({
              name,
              email,
              isVerified: true,
              provider: "Google",
            });
          }

          const token = generateToken({
            userId: userData._id,
            role: userData.role,
          });

          const toSend = {
            data: {
              name: userData.name,
              email: userData.email,
              id: userData._id,
              mobileNumber: userData.mobileNumber,
              role: userData.role,
              provider: userData.provider,
            },
            accessToken: token,
          };

          return done(null, toSend);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  console.log("Google OAuth configured");
} else {
  console.log("Google OAuth skipped: credentials not configured");
}

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
