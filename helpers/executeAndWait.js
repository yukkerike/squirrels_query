const waitForResult = require('./waitForResult')

module.exports = function (emitter, func, event, type, timeout = 0) {
    const promise = waitForResult(emitter, event, type, timeout)
    func()
    return promise
}