import sqlib from "sq-lib"
const { GameClient } = sqlib

export default function (host, ports) {
    let client = new GameClient({
        port: ports[Math.floor(Math.random() * ports.length)],
        host: host
    })
    return client
}