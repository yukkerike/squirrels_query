const {GameClient} = require("sq-lib");

module.exports = function (host, ports) {
    let client = new GameClient({
        port: ports[Math.floor(Math.random() * ports.length)],
        host: host
    })
    return client
}