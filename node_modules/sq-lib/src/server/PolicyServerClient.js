//  Module:     PolicyServerClient
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

const net = require('net')
const EventEmitter2 = require('eventemitter2')

const { Logger } = require('@sq-lib/common/utils/Logger')

class PolicyServerClient extends EventEmitter2 {
	constructor(options, socket, policyData) {
		super({wildcard: true})
		this.options = options
		this.socket = socket
		this.policyData = policyData
		this.state = {
			readBytes: 0x0,
			recv: ''
		}
		this.listenTo(socket, {
			close: 'client.close',
			connect: 'client.connect',
			data: 'client.data',
			drain: 'client.drain',
			end: 'client.end',
			error: 'client.error',
			lookup: 'client.lookup',
			ready: 'client.ready',
			timeout: 'client.timeout'
		})
		socket.setNoDelay(options.tcpNoDelay)
		socket.setTimeout(options.timeout)
		socket.on('data', (chunk) => this.onData(chunk))
	}
	open() {
		Logger.debug('net', 'PolicyServerClient.open')
		this.socket.resume()
	}
	close(error) {
		Logger.debug('net', 'PolicyServerClient.close')
		this.socket.destroy(error)
	}
	onData(chunk) {
		Logger.debug('net', 'PolicyServerClient.onData')
		this.state.readBytes += chunk.byteLength
		if(this.state.readBytes > this.policyData.request.length)
			return this.close(new Error(`unexpected data: "${this.state.recv}"`))
		this.state.recv += chunk.toString('latin1')
		if(!this.policyData.request.startsWith(this.state.recv))
			return this.close(new Error(`unexpected data: "${this.state.recv}"`))
		if(this.state.recv !== this.policyData.request)
			return
		this.sendData(this.policyData.content, () => this.close())
	}
	sendData(data, onSend) {
		this.socket.write(data, onSend)
	}
}

module.exports = {
	PolicyServerClient: PolicyServerClient
}