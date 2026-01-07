const path = require('path');
const fs = require('fs');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const releaseDir = path.resolve(__dirname, 'release');

  // Check if release directory exists and has files
  const hasReleaseFiles = fs.existsSync(releaseDir) &&
    fs.readdirSync(releaseDir).length > 0;

  const plugins = [];
  if (hasReleaseFiles) {
    plugins.push(
      new CopyPlugin({
        patterns: [
          { from: 'release', to: '.' },
        ],
      })
    );
  }

  return {
    entry: './src/index.tsx',
    output: {
      filename: 'panda-menu.js',
      path: path.resolve(__dirname, 'dist'),
      clean: false,
    },
    plugins,
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          resourceQuery: /inline/,
          use: [
            {
              loader: 'css-loader',
              options: {
                exportType: 'string',
              },
            },
            'postcss-loader',
          ],
        },
        {
          test: /\.css$/,
          resourceQuery: { not: [/inline/] },
          use: ['style-loader', 'css-loader', 'postcss-loader'],
        },
      ],
    },
    devtool: isProduction ? false : 'inline-source-map',
    optimization: {
      minimize: isProduction,
    },
  };
};
