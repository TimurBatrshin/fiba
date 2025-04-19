module.exports = {
  apiPath: "stubs/api",
  webpackConfig: {
    output: {
      publicPath: '/fiba/1.0.17/',
      filename: '[name].[fullhash].js',
      chunkFilename: '[name].[chunkhash].js',
      path: require('path').resolve(__dirname, 'dist')
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
  },
  /* use https://admin.bro-js.ru/ to create config, navigations and features */
  navigations: {
    "fiba.main": "/fiba",
  },
  features: {
    "fiba": {},
  },
  config: {
    "fiba.api": "/api",
    "cors": {
      "allowOrigin": "*"
    }
  },
  port: 8099,
  apiBaseUrl: 'https://timurbatrshin-fiba-backend-7cf2.twc1.net/api'
};
