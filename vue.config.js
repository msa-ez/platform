// https
const fs = require('fs');
const os=require('os');
const CompressionPlugin = require("compression-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

// const MonacoEditorPlugin = require('monaco-editor-webpack-plugin')
// const TerserPlugin = require("terser-webpack-plugin");

// 빌드 버전 생성
const BUILD_VERSION = process.env.BUILD_TIME || Date.now().toString();

module.exports = {
    filenameHashing: true,
    configureWebpack: {
        // plugins: [new CompressionPlugin({algorithm: "gzip", compressionOptions: { level: 1 }})],
        // optimization: {
        //     minimize: true,
        //     // minimizer: [new TerserPlugin()],
        //     splitChunks: {
        //         chunks: 'all',
        //     },
        // },
        devtool: 'source-map',
        resolve: {
            alias: {
                'fast-png': require.resolve('fast-png/lib/index.js')
            }
        },
        devServer: {
            port: '8081',
            // historyApiFallback: true,
            https: true,
            disableHostCheck: true,
        },
        // output: {
        //     filename: '[name].[contenthash:8].js',
        //     chunkFilename: '[name].[contenthash:8].js'
        // },
        module: {
            rules: [
                {
                    test: /\.(png|jpe?g|gif|svg|webp|ico)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: 'img/[name].[contenthash:8].[ext]'
                            }
                        }
                    ]
                },
                {
                    test: /\.(woff2?|eot|ttf|otf)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: 'fonts/[name].[contenthash:8].[ext]'
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new CompressionPlugin({
                algorithm: 'gzip',
                test: /\.(js|css|html|svg)$/,
                threshold: 10240,
                minRatio: 0.8
            }),
            // 빌드 버전을 전역 변수로 주입
            new (require('webpack')).DefinePlugin({
                'process.env.VUE_APP_BUILD_VERSION': JSON.stringify(BUILD_VERSION)
            })
        ]
        // plugins: [new BundleAnalyzerPlugin({
        //     analyzerMode: 'static', // 분석파일 html을 dist 폴더에 저장.
        //     reportFilename: 'bundle-report.html', // 분석파일 이름
        //     openAnalyzer: false, // 분석창 실행시 오픈 여부
        //     generateStatsFile: true, // 분석파일을 json 으로 저장.
        //     statsFilename: 'bundle-stats.json' // 분석파일 json 이름
        // })]
    },
    chainWebpack: config => {
        // HtmlWebpackPlugin에 빌드 버전 전달
        config
            .plugin('html')
            .tap(args => {
                args[0].buildVersion = BUILD_VERSION
                return args
            })
        
        // fast-png 모듈은 configureWebpack의 alias에서 처리됨
    },
    transpileDependencies: [
        'fast-png'
    ],
    "runtimeCompiler": true,
    css: {
        extract: {
            filename: '[name].[contenthash:8].css',
            chunkFilename: '[name].[contenthash:8].css'
        }
    }
}

// http
// module.exports = {
//     configureWebpack: {
//         devServer: {
//             host: 'labs.msaez.io',
//             port: '8081',
//             disableHostCheck: true
//         }
//     },
//     "transpileDependencies": [
//         "vuetify"
//     ],
//     "runtimeCompiler": true
// }
