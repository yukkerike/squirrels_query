module.exports = function (emitter, event, type, timeout = 0) {
    const onPacket = (resolve, packet) => {
        // if (typeof(type) === 'function') console.log('test', packet, type(packet))
        if (typeof (type) === 'function' && type(packet) || packet.type === type) {
            emitter.off(event, onPacket)
            clearTimeout(timeoutId)
            resolve(packet)
        }
    }
    let timeoutId
    return new Promise(
        (resolve, reject) => {
            emitter.on(event, onPacket.bind(this, resolve))
            if (timeout > 0) {
                timeoutId = setTimeout(() => {
                    emitter.off(event, onPacket)
                    console.error('Timeout', type)
                    reject(new Error('Timeout'))
                }, timeout)
            }
        }
    )
}