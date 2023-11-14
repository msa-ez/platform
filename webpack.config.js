const MonacoEditorPlugin = require("monaco-editor-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
// const TerserPlugin = require("terser-webpack-plugin");
module.exports = {
    plugins: [
        new CompressionPlugin({
            algorithm: "gzip",
            compressionOptions: { level: 9 },
        }),
        new MonacoEditorPlugin({
            //
            // Include a subset of languages support
            // Some language extensions like typescript are so huge that may impact build performance
            // e.g. Build full languages support with webpack 4.0 takes over 80 seconds
            // Languages are loaded on demand at runtime
            languages: ["javascript", "css", "html", "typescript", "java"],
        }),
    ],
    optimization: {
        minimize: true,
        // minimizer: [new TerserPlugin()],
        splitChunks: {
            chunks: "all",
        },
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader", "cssimportant-loader"],
            },
            {
                test: /\.vue$/,
                exclude: ["./public/static/templates/"],
            },
            {
                test: /\.m?js$/,
                type: "javascript/auto",
                resolve: {
                    fullySpecified: false,
                },
            },
        ],
    },

    devServer: {
        host: "http://es2cd.io",
        port: 8080,
        disableHostCheck: true,
    },
};
