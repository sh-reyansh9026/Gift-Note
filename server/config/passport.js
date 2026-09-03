import dotenv from 'dotenv';
dotenv.config();
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import Seller from '../models/Seller.js';
import jwt from 'jsonwebtoken';

// Serialize user for session
passport.serializeUser((seller, done) => {
  done(null, seller._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const seller = await Seller.findById(id);
    done(null, seller);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
    
        const email = profile.emails[0].value;
        const googleId = profile.id;
     

        let seller = await Seller.findOne({ googleId });

        if (seller) {
          // Existing Google OAuth user
          return done(null, seller);
        }

        seller = await Seller.findOne({ email });

        if (seller) {

          seller.googleId = googleId;
          seller.oauthProvider = 'google';
          await seller.save();
          return done(null, seller);
        }

        // Create new seller from Google profile

        const newSeller = new Seller({
          email,
          googleId,
          oauthProvider: 'google',
          businessName: profile.displayName || email.split('@')[0],
          logo: profile.photos?.[0]?.value || '',
          instagramLink: '',
        });

        await newSeller.save();
        return done(null, newSeller);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

export default passport;
