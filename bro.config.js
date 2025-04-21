const pkg = require("./package");

module.exports = {
  webpackConfig: {
    output: {
      publicPath: `/apps/FIBA3x3/${process.env.VERSION || pkg.version}/`,
    },
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            'style-loader',  // Injects styles into the DOM
            'css-loader',    // Resolves CSS imports and dependencies
            'sass-loader',   // Compiles SCSS to CSS
          ],
        },
      ],
    },
    resolve: {
      fallback: {
        "path": false,
        "fs": false
      }
    }
  },
  /* Navigation routes for the application */
  navigations: {
    "fiba.main": "/fiba",
    "fiba.tournaments": "/fiba/tournaments",
    "fiba.teams": "/fiba/teams",
    "fiba.profile": "/fiba/profile",
    "fiba.signin": "/fiba/signin",
    "fiba.signup": "/fiba/signup",
    "fiba.admin": "/fiba/admin",
  },
  features: {
    "fiba": {}
  },
  config: {
    "fiba.api": "/api",
    "fiba.static": "https://static.bro-js.ru/",
    "fiba.ms": "/ms",
    "fiba.version": "1.6.3"
  },
  port: 8099,
  apiBaseUrl: 'https://timurbatrshin-fiba-backend-e561.twc1.net/api'
};
