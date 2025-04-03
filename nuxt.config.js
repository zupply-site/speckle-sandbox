require("dotenv").config();

import path from "path"; // Import path module

export default {
  debug: true,
  /*
   ** Nuxt rendering mode
   ** See https://nuxtjs.org/api/configuration-mode
   */
  ssr: false,
  /*
   ** Nuxt target
   ** See https://nuxtjs.org/api/configuration-target
   */
  target: "server",
  /*
   ** Headers of the page
   ** See https://nuxtjs.org/api/configuration-head
   */
  head: {
    titleTemplate: "test sandbox",
    title: process.env.npm_package_name || "",
    script: [],
    meta: [
      { charset: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width,initial-scale=0.5,maximum-scale=0.5,user-scalable=no",
      },
      {
        hid: "description",
        name: "description",
        content: process.env.npm_package_description || "",
      },
    ],
    link: [],
  },
  /*
   ** Global CSS
   */

  /*
   ** Plugins to load before mounting the App
   ** https://nuxtjs.org/guide/plugins
   */
  plugins: [],
  // serverMiddleware: ["~/middleware/memory-monitor.js"],
  /*
   ** Auto import components
   ** See https://nuxtjs.org/api/configuration-components
   */
  components: true,
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: ["@nuxtjs/vuetify"],
  /*
   ** Nuxt.js modules
   */
  modules: ["@nuxtjs/pwa", "@nuxtjs/axios", "@nuxtjs/auth-next"],

  router: {
    middleware: [],
  },

  /*
   ** vuetify module configuration
   ** https://github.com/nuxt-community/vuetify-module
   */
  vuetify: {
    theme: {
      options: {
        customProperties: true,
      },
      themes: {
        light: {
          primary: "#0b5351",
          secondary: "#ED4747",
          accent: "#e9c46a",
          info: "#f4a261",
          background: "#e76f51",
          tablestripes: "#F8FBFF",
        },
      },
    },
    defaultAssets: {
      font: {
        family: "Poppins",
      },
    },
    typography: {
      fontFamily: "Poppins, sans-serif",
    },
    treeShake: true,
  },
  env: {
    SPECKLE_KEY: process.env.SPECKLE_KEY,
  },
  /*
   ** Build configuration
   ** See https://nuxtjs.org/api/configuration-build/
   */
  build: {
    sourcemap: { server: true, client: true }, // Seems to be not working wihtout setting it in extend() too
    transpile: ["@speckle/viewer", "@speckle/shared", "true-myth"],
    extend(config, { isDev, isClient }) {
      // --- Lodash Alias ---
      config.resolve.alias = config.resolve.alias || {};
      config.resolve.alias["#lodash"] = "lodash";

      // --- Conditional true-myth Alias ---
      if (!isDev) {
        // Production Build (!isDev === true)
        console.log(
          ">>> [PROD] Attempting to alias true-myth to CJS files using path.resolve..."
        );
        try {
          // *** Point alias to specific CJS files ***
          // Verify these paths/extensions exist in node_modules/true-myth/dist/cjs/
          const maybeCjsPath = path.resolve(
            __dirname,
            "node_modules/true-myth/dist/cjs/maybe.cjs"
          );
          const resultCjsPath = path.resolve(
            __dirname,
            "node_modules/true-myth/dist/cjs/result.cjs"
          );

          config.resolve.alias["true-myth/maybe"] = maybeCjsPath;
          config.resolve.alias["true-myth/result"] = resultCjsPath;
          console.log(
            `>>> [PROD] Successfully aliased true-myth paths to CJS files: ${maybeCjsPath}`
          );
        } catch (e) {
          console.error(
            "!!! [PROD] Failed to setup true-myth CJS alias using path.resolve. Falling back.",
            e
          );
          // Fallback to the alias that worked for building production before
          config.resolve.alias["true-myth/maybe"] = require.resolve(
            "true-myth"
          );
          config.resolve.alias["true-myth/result"] = require.resolve(
            "true-myth"
          );
        }
      } else {
        // Development Build (isDev === true)
        console.log(">>> [DEV] Aliasing true-myth paths to main package.");
        try {
          // Keep the original alias that worked for dev
          config.resolve.alias["true-myth/maybe"] = require.resolve(
            "true-myth"
          );
          config.resolve.alias["true-myth/result"] = require.resolve(
            "true-myth"
          );
        } catch (e) {
          console.error("!!! [DEV] Could not resolve 'true-myth'.", e);
        }
      }

      // --- Force devtool (keep this for production sourcemaps) ---
      if (!isDev && isClient) {
        const originalDevtool = config.devtool;
        config.devtool = "source-map";
        console.log(
          `>>> [PROD] Webpack client 'devtool' was: ${originalDevtool}, forced to: ${config.devtool}`
        );
      }
    },
  },
};
