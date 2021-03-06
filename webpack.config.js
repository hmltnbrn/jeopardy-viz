const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: {
    main: './src/javascript/index.js',
    topics: './src/javascript/topics.js',
    states: './src/javascript/states.js',
    genderDonut: './src/javascript/gender-donut.js',
    genderBar: './src/javascript/gender-bar.js',
    genderLine: './src/javascript/gender-line.js',
    genderTopic: './src/javascript/gender-topic.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        loader: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: 'images',
              name: '[name].[ext]',
              esModule: false
            }
          }
        ]
      },
      {
        test: /\.(json)$/,
        type: "javascript/auto",
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: 'data',
              name: '[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(csv|tsv)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: 'data',
              name: '[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|ttf|otf|eot)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: 'fonts',
              name: '[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.scss']
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: './index.html',
      inject: true,
      chunks: ['main', 'topics', 'states', 'genderDonut', 'genderBar', 'genderLine', 'genderTopic']
    }),
    new HtmlWebPackPlugin({
      template: './src/about.html',
      filename: './about.html',
      inject: true,
      chunks: ['main']
    }),
    new HtmlWebPackPlugin({
      template: './src/methods.html',
      filename: './methods.html',
      inject: true,
      chunks: ['main']
    })
  ],
};
