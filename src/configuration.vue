<template>
    <ul class="configuration__root">
        <configuration-rules-select
            v-for="category of categories"
            :key="category.name"
            :category="category"
            :config="config"
        />
    </ul>
</template>

<script>
import ConfigurationRulesSelect from "./configuration-rules-select.vue"
import { ruleCategories } from "./lib/rule-categories"

export default {
    name: "Configuration",

    components: { ConfigurationRulesSelect },

    props: {
        config: {
            type: Object,
            default() {
                return {}
            },
        },
    },

    computed: {
        categories() {
            return ruleCategories.filter(category => category.rules.length >= 1)
        },
    },
}
</script>

<style>
.configuration__root {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    overflow-y: scroll;
}
</style>
