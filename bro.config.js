const pkg = require("./package");

module.exports = {
  webpackConfig: {
    output: {
      publicPath: `https://timurbatrshin-fiba-backend-5ef6.twc1.net/api/proxy/static-bro-js/fiba3x3/${process.env.VERSION || pkg.version}/`,
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
    "fiba.static": "https://timurbatrshin-fiba-backend-5ef6.twc1.net/api/proxy/static-bro-js/",
    "fiba.ms": "/ms",
    "fiba.version": "1.8.0"
  },
  port: 8099,
  apiBaseUrl: '/api' // Используем реальный API
};
