const pkg = require("./package");

module.exports = {
  apiPath: "stubs/api",
  webpackConfig: {
    output: {
      publicPath: `/static/${pkg.name}/${process.env.VERSION || pkg.version}/`,
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
  /* use https://admin.bro-js.ru/ to create config, navigations and features */
  navigations: {
    "fiba3x3.main": "/fiba3x3",
    "fiba3x3.tournaments": "/fiba3x3/tournaments",
    "fiba3x3.teams": "/fiba3x3/teams",
    "fiba3x3.profile": "/fiba3x3/profile",
    "fiba3x3.signin": "/fiba3x3/signin",
    "fiba3x3.signup": "/fiba3x3/signup",
    "fiba3x3.admin": "/fiba3x3/admin",
    "fiba3x3.signin.signwithtelegram": "/fiba3x3/signin/signwithtelegram",
  },
  features: {
    "fiba3x3": {}
  },
  config: {
    "fiba.api": "/api"
  },
  port: 8099,
  apiBaseUrl: 'https://timurbatrshin-fiba-backend-7cf2.twc1.net/api'
};
