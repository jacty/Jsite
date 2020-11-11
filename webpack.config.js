const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDev = true;// mode flag.

module.exports = {
    mode:isDev ? 'development':'production',
    entry:'./src/index.jsx',
    devServer:{
        historyApiFallback:true,
        contentBase:'./dist',
        inline:true,
        // hot:true,
    },
    plugins:[
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template:'./src/index.html',
            title:'demo'
        }),
        new MiniCssExtractPlugin({
            filename:'[name].css',
            chunkFilename:'[id].css'
        })
    ],
    output:{
        filename:'main.js',
        path:path.resolve(__dirname, 'dist'),
    },
    module:{
        rules:[{
            test:/\.sass$/,
            use:[MiniCssExtractPlugin.loader,'css-loader','sass-loader']
        },{
            test:/.jsx$/,
            exclude:/node_modules/,
            use:[
            {
                loader:'babel-loader'
            }]
        },{
            test:/\.(png|jpg)$/,
            exclude:/node_modules/,
            use:[
            {
                loader:'url-loader?limit=8192'
            }]
        }]
    },
    // optimization:{
    //     moduleIds:'hashed',
    //     runtimeChunk: 'single',
    //     splitChunks:{
    //         cacheGroups: {
    //             vendor: {
    //                 test: /[\\/]node_modules[\\/]/,
    //                 name:'vendors',
    //                 chunks:'all',
    //             },
    //         },
    //     },
    // }
}