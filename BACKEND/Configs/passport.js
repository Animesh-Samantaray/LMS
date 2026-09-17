import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../Models/User.model.js";
import StudentProfile from "../Models/StudentProfile.model.js";
import InstructorProfile from "../Models/InstructorProfile.model.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();

        if (!email) {
          return done(
            new Error("Google account does not provide an email address"),
            null
          );
        }

        const googleId = profile.id;
        const name =
          profile.displayName ||
          `${profile.name?.givenName || ""} ${
            profile.name?.familyName || ""
          }`.trim();
        const profileImage = profile.photos?.[0]?.value || "";
        const allowedRoles = ["Student", "Instructor"];
        const selectedRole = req.query?.state || "Student";

        if (!allowedRoles.includes(selectedRole)) {
          return done(new Error("Please select a valid role"), null);
        }

        let user = await User.findOne({ googleId });

        if (user) {
          if (user.accountStatus !== "active") {
            return done(new Error("Your account is not active"), null);
          }
          return done(null, user);
        }

        user = await User.findOne({ email });

        if (user) {
          if (user.role === "Admin") {
            return done(new Error("Admin accounts cannot use Google login"), null);
          }

          if (user.accountStatus !== "active") {
            return done(new Error("Your account is not active"), null);
          }

          user.googleId = googleId;
          user.authProvider = user.authProvider === "local" ? "local_google" : "google";

          if (!user.profileImage && profileImage) {
            user.profileImage = profileImage;
          }

          await user.save();
          return done(null, user);
        }

        user = await User.create({
          name: name || "Google User",
          email,
          googleId,
          profileImage,
          role: selectedRole,
          authProvider: "google",
          accountStatus: "active",
        });

        if (selectedRole === "Student") {
          await StudentProfile.create({ user: user._id });
        }

        if (selectedRole === "Instructor") {
          await InstructorProfile.create({ user: user._id });
        }

        return done(null, user);
      } catch (error) {
        console.error("Google Authentication Error:", error);
        return done(error, null);
      }
    }
  )
);

export default passport;