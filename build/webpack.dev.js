const merge = require("webpack-merge");
const commonConfig = require("./webpack.common.js");

const devConfig = {
    mode: "development",
    devtool: "source-map",
    output: {
        filename: "[name].js",
    },
    devServer: {
        overlay: true, //将报错信息提示到页面上
        contentBase: "./dist",
        open: true,
        port: 3000,
        hot: true,
    },
};

module.exports = merge(commonConfig, devConfig);