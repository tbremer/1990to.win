const path = require('path');

const config = {
  entry: path.join(__dirname, '/client/components/index.ts'),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/i,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'assets'),
  },
};

module.exports = (_env, argv) => {
  // use content hash for filename cache busting
  if (argv.mode === 'production') {
    config.output.filename = '[contenthash].bundle.js';
  }

  return config;
};
