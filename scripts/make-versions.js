const fs = require("fs")

fs.writeFileSync(
    "dist/versions.json",
    JSON.stringify({
        "@typescript-eslint/eslint-plugin": require("@typescript-eslint/eslint-plugin/package.json")
            .version,
        "@typescript-eslint/parser": require("@typescript-eslint/parser/package.json")
            .version,
        eslint: require("eslint/package.json").version,
        typescript: require("typescript/package.json").version,
        "typescript-eslint-demo": require("../package.json").version,
    }),
)
