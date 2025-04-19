module.exports = {
  apiPath: "stubs/api",
  webpackConfig: {
    output: {
      publicPath: `/static/fiba/1.0.2/`,
      filename: '[name].[fullhash].js',
      chunkFilename: '[name].[chunkhash].js'
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
  },
  port: 8099,
  apiBaseUrl: 'https://timurbatrshin-fiba-backend-7cf2.twc1.net/api'
};
