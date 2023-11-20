// https
const fs = require('fs');
const os=require('os');

// const MonacoEditorPlugin = require('monaco-editor-webpack-plugin')
const CompressionPlugin = require("compression-webpack-plugin");
// const TerserPlugin = require("terser-webpack-plugin");
module.exports = {
    configureWebpack: {
        // plugins: [new CompressionPlugin({algorithm: "gzip", compressionOptions: { level: 1 }})],
        // optimization: {
        //     minimize: true,
        //     // minimizer: [new TerserPlugin()],
        //     splitChunks: {
        //         chunks: 'all',
        //     },
        // },
        devServer: {
            port: '8080',
            // historyApiFallback: true,
            https: true,
            disableHostCheck: true,
        },
        // plugins: [new BundleAnalyzerPlugin({
        //     analyzerMode: 'static', // 분석파일 html을 dist 폴더에 저장.
        //     reportFilename: 'bundle-report.html', // 분석파일 이름
        //     openAnalyzer: false, // 분석창 실행시 오픈 여부
        //     generateStatsFile: true, // 분석파일을 json 으로 저장.
        //     statsFilename: 'bundle-stats.json' // 분석파일 json 이름
        // })]
    },
    "runtimeCompiler": true
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
