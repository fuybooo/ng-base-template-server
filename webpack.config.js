const path = require('path');
const webpack = require('webpack');
const uglifyjs = require('uglifyjs-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.ts',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'build')
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: require.resolve('ts-loader'),
                    },
                ],
            }
        ]
    },
    resolve: {
        extensions: [
            '.ts',
            '.js'
        ],
        modules: ['node_modules'],
    },
    plugins: [
        new webpack.BannerPlugin('版权所有，翻版必究'),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new uglifyjs(),
    ],
};