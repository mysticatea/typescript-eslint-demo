import pako from "pako"
import { clone } from "../lib/clone"
import { initialState } from "./initial-state"

/**
 * Deserialize a given serialized string then update this object.
 * @param {string} serializedString A serialized string.
 * @returns {object} The deserialized state.
 */
export function deserializeState(serializedString) {
    const state = clone(initialState)

    if (serializedString === "") {
        return state
    }

    try {
        const decodedText = atob(serializedString)
        const jsonText = pako.inflate(decodedText, { to: "string" })
        const json = JSON.parse(jsonText)

        if (typeof json === "object" && json !== null) {
            if (typeof json.code === "string") {
                state.code = json.code
            }

            if (typeof json.rules === "object" && json.rules !== null) {
                for (const id of Object.keys(state.config.rules)) {
                    state.config.rules[id] = json.rules[id] ? 2 : 0
                }
            }

            if (
                json.indentSize === 2 ||
                json.indentSize === 4 ||
                json.indentSize === 8
            ) {
                state.indentSize = json.indentSize
            }

            if (json.indentType === "space" || json.indentType === "tab") {
                state.indentType = json.indentType
            }
        }
    } catch (error) {
        console.error(error)
    }

    return state
}
