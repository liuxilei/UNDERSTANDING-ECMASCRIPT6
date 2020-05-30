const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        main: "./src/index.js",
    },
    resolve: {
        alias: {
            '@': path.join(__dirname, '../src'),
            "es6": path.join(__dirname, "../src/es6")
        },
        extensions: [".js"]
    },
    //Code Splitting(代码分割)
    optimization: {
        splitChunks: {
            chunks: "all"
        }
    },
    module: {
        rules: [
            {
                test: /\.ico$/,
                use: [
                    'file-loader'
                ]
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ["babel-loader", "eslint-loader"]
            },
        ]
    },
    output: {
        path: path.resolve(__dirname, "../dist")
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
        }),
    ],
}