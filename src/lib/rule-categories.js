import { linter } from "./eslint"

// Initialize the categories of rules.
/** @type {{name:string,rules:{name:string,description:string,fixable:boolean}[]}[]} */
export const ruleCategories = (() => {
    const ruleMap = linter.getRules()
    const categoryMap = {
        problem: {
            name: "Best practice rules",
            rules: [],
        },
        suggestion: {
            name: "Suggestion rules",
            rules: [],
        },
        layout: {
            name: "Whitespace rules",
            rules: [],
        },
        uncategorized: {
            name: "Uncategorized",
            rules: [],
        },
        core: {
            name: "ESLint core rules",
            rules: [],
        },
    }

    for (const entry of ruleMap) {
        const name = entry[0]
        const meta = entry[1].meta
        if (meta == null || meta.docs == null || meta.deprecated) {
            continue
        }
        const category = name.startsWith("@typescript-eslint/")
            ? categoryMap[meta.type] || categoryMap.uncategorized
            : categoryMap.core

        category.rules.push({
            name,
            description: meta.docs.description || "no description",
            url: meta.docs.url,
            fixable: Boolean(meta.fixable),
        })
    }

    return Object.keys(categoryMap).map(id => categoryMap[id])
})()
