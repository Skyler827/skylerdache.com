const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
    app: './src/index.js',
    print: './src/print.js',
    animation: './src/animation.js'
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebPackPlugin({
      title: "The Personal Website of Skyler Daché",
      template: "src/index.html",
      filename: "index.html",
      chunks: ['app']
    }),
    new HtmlWebPackPlugin({
      title: "Animation",
      template: "src/animation.html",
      filename: "animation.html",
      chunks: ['animation']
    }),
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module:{
    rules:[
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  mode: 'development'
};
