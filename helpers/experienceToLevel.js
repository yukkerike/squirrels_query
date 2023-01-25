const {ClientData} = require("sq-lib")

module.exports = function (exp) {
    const levels = ClientData.ConfigData.player.levels
    for (let i = 0; i < levels.length; i++) {
        if (exp < levels[i].experience)
            return i - 1
    }
    return ClientData.ConfigData.player.MAX_LEVEL
}