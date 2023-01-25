//  Module:     GameClient
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

class GameClient extends EventEmitter2 {
	constructor(options) {
		super({wildcard: true})
		this.options = options
		this.socket = new net.Socket()
		this.packetId = 0x0
		this.dissector = new Dissector()
		this.listenTo(this.socket, {
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
		this.socket.setNoDelay(Boolean(options.tcpNoDelay ?? 0))
		this.socket.setTimeout(options.timeout ?? 45000)
		this.socket.on('data', (chunk) => this.onData(chunk))
	}
	open() {
		Logger.debug('net', 'GameClient.open')
		this.socket.connect({
			port: this.options.port ?? 11111,
			host: this.options.host ?? '127.0.0.1'
		})
	}
	close(error) {
		Logger.debug('net', 'GameClient.close')
		this.socket.destroy(error)
	}
	onData(chunk) {
		Logger.debug('net', 'GameClient.onData')
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
			packet = PacketServer.from(result.buffer)
		} catch(error) {
			return this.emit('packet.error', error)
		}
		this.emit('packet.incoming', packet, result.buffer)
		if(result.remainder === undefined)
			return
		this.onData(result.remainder)
	}
	sendData(type, ...data) {
		Logger.debug('net', 'GameClient.sendData')
		let packet = new PacketClient(type, ...data)
		this.sendPacket(packet)
	}
	sendPacket(packet) {
		Logger.debug('net', 'GameClient.sendPacket')
		packet.id = this.packetId++
		let buffer = packet.toBuffer()
		this.socket.write(buffer, () => this.emit('packet.outcoming', packet, buffer))
	}
}

module.exports = {
	GameClient: GameClient
}