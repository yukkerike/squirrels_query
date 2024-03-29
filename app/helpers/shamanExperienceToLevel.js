import sqlib from "sq-lib"
const { ClientData } = sqlib

export default function (exp) {
    const levels = ClientData.ConfigData.shaman.levels
    for (let i = 0; i < levels.length; i++) {
        if (exp < levels[i])
            return i + 1
    }
    return ClientData.ConfigData.shaman.MAX_LEVEL + 1
}