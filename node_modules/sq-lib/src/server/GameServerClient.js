//  Module:     GameServerClient
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

const net = require('net')
const EventEmitter2 = require('eventemitter2')

const { Logger } = require('@sq-lib/common/utils/Logger')
const { Dissector } = require('@sq-lib/common/Dissector')
const { PacketClient } = require('@sq-lib/common/PacketClient')
const { PacketServer } = require('@sq-lib/common/PacketServer')

class GameServerClient extends EventEmitter2 {
	constructor(options, socket) {
		super({wildcard: true})
		this.options = options
		this.socket = socket
		this.dissector = new Dissector()
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
		Logger.debug('net', 'GameServerClient.open')
		this.socket.resume()
	}
	close(error) {
		Logger.debug('net', 'GameServerClient.close', error)
		this.socket.destroy(error)
	}
	onData(chunk) {
		Logger.debug('net', 'GameServerClient.onData')
		let result
		try {
			result = this.dissector.read(chunk)
		} catch(error) {
			return this.close(error)
		}
		if(result.buffer === undefined)
			return
		let packet
		try {
			packet = PacketClient.from(result.buffer)
		} catch(error) {
			return this.emit('packet.error', error)
		}
		this.emit('packet.incoming', packet, result.buffer)
		if(result.remainder === undefined)
			return
		this.onData(result.remainder)
	}
	sendData(type, data) {
		Logger.debug('net', 'GameServerClient.sendData')
		let packet = new PacketServer(type, data)
		this.sendPacket(packet)
	}
	sendPacket(packet) {
		Logger.debug('net', 'GameServerClient.sendPacket')
		let buffer = packet.toBuffer()
		this.socket.write(buffer, () => this.emit('packet.outcoming', packet, buffer))
	}
}

module.exports = {
	GameServerClient: GameServerClient
}