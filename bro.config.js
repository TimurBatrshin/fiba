const pkg = require("./package");

module.exports = {
  webpackConfig: {
    output: {
      publicPath: `/static/fiba3x3/${process.env.VERSION || pkg.version}/`,
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
    "fiba.api": "/api"
  },
  port: 8099,
  apiBaseUrl: 'https://timurbatrshin-fiba-backend-7cf2.twc1.net/api'
};
