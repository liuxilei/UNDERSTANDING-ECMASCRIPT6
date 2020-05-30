const merge = require("webpack-merge");
const commonConfig = require("./webpack.common.js");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const prodConfig = {
    mode: "production",
    devtool: "cheap-module-source-map",
    output: {
        filename: "[name].[contenthash].js",
    },
    plugins: [
        new CleanWebpackPlugin(),
        new BundleAnalyzerPlugin()
    ]
};

module.exports = merge(commonConfig, prodConfig);