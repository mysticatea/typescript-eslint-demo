const fs = require("fs")
const path = require("path")
const postcssPresetEnv = require("postcss-preset-env")
const VueLoaderPlugin = require("vue-loader/lib/plugin")

// Shim for `src/versions.js`
const VERSIONS = `export default ${JSON.stringify({
    "typescript-eslint-demo": {
        repo: "mysticatea/typescript-eslint-demo",
        version: require("./package.json").version,
    },
    "@typescript-eslint/eslint-plugin": {
        repo: "https://typescript-eslint.io/eslint-plugin",
        version: require("@typescript-eslint/eslint-plugin/package.json")
            .version,
    },
    "@typescript-eslint/parser": {
        repo: "https://typescript-eslint.io/parser",
        version: require("@typescript-eslint/parser/package.json").version,
    },
    eslint: {
        repo: "eslint/eslint",
        version: require("eslint/package.json").version,
    },
    typescript: {
        repo: "Microsoft/TypeScript",
        version: require("typescript/package.json").version,
    },
})}`

// Shim for `@typescript-eslint/eslint-plugin/lib/index.js`
const tsPluginRuleRoot = path.resolve(
    __dirname,
    "node_modules/@typescript-eslint/eslint-plugin/lib/rules",
)
const tsPluginIndex = `module.exports.rules = {${fs
    .readdirSync(tsPluginRuleRoot)
    .map(filename => path.basename(filename, ".js"))
    .map(
        name =>
            `${JSON.stringify(name)}: require(${JSON.stringify(
                `./rules/${name}`,
            )})`,
    )
    .join(",")}}`

module.exports = env => {
    const prod = Boolean(env && env.production)
    const mode = prod ? "production" : "development"
    const browserlist = [">1%", "not dead", "not ie 11"]

    return {
        mode,
        target: "web",
        entry: "./src/index.js",
        output: {
            path: path.resolve(__dirname, "./dist"),
            filename: "index.js",
        },
        module: {
            rules: [
                {
                    test: /\.vue$/u,
                    use: ["vue-loader"],
                },
                {
                    test: /\.m?js$/u,
                    exclude: /node_modules[\\/](?!vue-eslint-editor)/u,
                    use: [
                        {
                            loader: "babel-loader",
                            options: {
                                babelrc: false,
                                cacheDirectory: true,
                                plugins: [
                                    "@babel/plugin-syntax-dynamic-import",
                                    [
                                        "@babel/plugin-transform-runtime",
                                        { useESModules: true },
                                    ],
                                ],
                                presets: [
                                    [
                                        "@babel/preset-env",
                                        {
                                            modules: false,
                                            targets: browserlist,
                                            useBuiltIns: "entry",
                                        },
                                    ],
                                ],
                            },
                        },
                    ],
                },
                {
                    test: /\.css$/u,
                    use: [
                        {
                            loader: "vue-style-loader",
                            options: {},
                        },
                        {
                            loader: "css-loader",
                            options: {},
                        },
                        {
                            loader: "postcss-loader",
                            options: {
                                plugins: [
                                    postcssPresetEnv({
                                        browsers: browserlist,
                                        stage: 3,
                                    }),
                                ],
                            },
                        },
                    ],
                },
                {
                    test: /\.(png|jpg|gif|svg|eot|ijmap|ttf|woff2?)$/u,
                    use: [
                        {
                            loader: "url-loader",
                            options: {
                                limit: 8192,
                            },
                        },
                    ],
                },
                // Replace `./src/versions.js` with the current versions.
                {
                    test: /src[\\/]versions/u,
                    use: [
                        {
                            loader: "string-replace-loader",
                            options: {
                                search: "[\\s\\S]+", // whole file.
                                replace: VERSIONS,
                                flags: "g",
                            },
                        },
                    ],
                },
                // Patch for `eslint-utils` -- accessing `global` causes build error.
                {
                    test: /node_modules[/\\]eslint-utils[/\\]index\.m?js$/u,
                    use: [
                        {
                            loader: "string-replace-loader",
                            options: {
                                search: "\\bin global\\b",
                                replace: "in window",
                                flags: "g",
                            },
                        },
                        {
                            loader: "string-replace-loader",
                            options: {
                                search: "\\bglobal\\[",
                                replace: "window[",
                                flags: "g",
                            },
                        },
                    ],
                },
                // Patch for `typescript`
                {
                    test: /node_modules[/\\]typescript[/\\]lib[/\\]typescript.js$/u,
                    use: [
                        {
                            loader: "string-replace-loader",
                            options: {
                                search: "require\\(.+?\\)",
                                replace: "null",
                                flags: "g",
                            },
                        },
                    ],
                },
                // Patch for `@typescript-eslint/parser` -- eliminate dynamic loading.
                {
                    test: /node_modules[/\\]@typescript-eslint[/\\]eslint-plugin[/\\]lib[/\\]index\.js$/u,
                    use: [
                        {
                            loader: "string-replace-loader",
                            options: {
                                search: "[\\s\\S]+", // whole file.
                                replace: tsPluginIndex,
                                flags: "g",
                            },
                        },
                    ],
                },
            ],
        },
        resolve: {
            alias: {
                vue$: "vue/dist/vue.esm.js",
            },
            extensions: [".mjs", ".js", ".vue", ".json"],
        },
        plugins: [new VueLoaderPlugin()],
        devServer: {
            contentBase: path.join(__dirname, "dist"),
            compress: true,
        },
        performance: {
            hints: false,
        },
        devtool: false,
    }
}
