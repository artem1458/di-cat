import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import DICatWebpackPlugin from 'dependency-injection-cat/plugins/webpack';

module.exports = {
    entry: './src/index.ts',
    mode: 'development',
    devtool: 'source-map',
    resolve: {
        extensions: ['.js', '.ts'],
        plugins: [new TsconfigPathsPlugin()]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                options: {
                    compiler: 'ttypescript',
                    transpileOnly: false,
                    configFile: 'tsconfig.ttypescriptCompiler.json'
                }
            }
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new DICatWebpackPlugin(),
    ]
};
