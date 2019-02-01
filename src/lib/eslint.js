import Linter from "eslint4b"
import plugin from "@typescript-eslint/eslint-plugin"
import * as parser from "@typescript-eslint/parser"

export const linter = new class extends Linter {
    constructor() {
        super()

        this.defineParser("@typescript-eslint/parser", parser)

        for (const name of Object.keys(plugin.rules)) {
            this.defineRule(`@typescript-eslint/${name}`, plugin.rules[name])
        }
    }
}()
