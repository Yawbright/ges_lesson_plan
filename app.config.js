const path = require('path');

// Ensures EXPO_PUBLIC_* from .env are available when Expo evaluates config (Node),
// and exposes them to the runtime via expo-constants `extra` as a fallback when Metro
// does not inline env (e.g. some Windows / cache cases).
require('dotenv').config({ path: path.join(__dirname, '.env') });

const appJson = require('./app.json');

module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    },
  },
};
