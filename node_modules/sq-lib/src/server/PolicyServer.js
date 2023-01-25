//  Module:     PolicyServer
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

const net = require('net')
const EventEmitter2 = require('eventemitter2')

const { Logger } = require('@sq-lib/common/utils/Logger')
const { ProtocolData } = require('@sq-lib/shared/ProtocolData')
const { PolicyServerClient } = require('@sq-lib/server/PolicyServerClient')
const { Protection } = require('@sq-lib/common/Protection')

class PolicyServer extends EventEmitter2 {
	constructor(options) {
		super({wildcard: true})
		this.options = options
		options.allowedPorts = options.allowedPorts ?? [11111]
		options.tcpNoDelay = Boolean(options.tcpNoDelay ?? 0)
		options.timeout = options.timeout ?? 18000
		options.maxConns = options.maxConns ?? 5000
		options.maxConnsQueue = options.maxConnsQueue ?? 100
		options.maxConnsPerIP = options.maxConnsPerIP ?? 1
		options.maxConnsPerIpCloseNew = Boolean(options.maxConnsPerIpCloseNew ?? 1)
		this.server = new net.Server({
			allowHalfOpen: false,
			pauseOnConnect: true,
			backlog: options.maxConnsQueue
		})
		this.server.maxConnections = options.maxConns
		this.listenTo(this.server, {
			close: 'server.close',
			connection: 'server.connection',
			error: 'server.error',
			listening: 'server.listening'
		}, {
			reducers: (args) => args.data.unshift(this.server)
		})
		this.policyData = {
			request: ProtocolData.POLICY_FILE_REQUEST,
			content: ProtocolData.POLICY_FILE_CONTENT.replace(
				'%0',
				options.allowedPorts.join(',')
			)
		}
		this.clients = []
		this.protection = new Protection(this)
		this.on('server.connection', this.protection.onConnect.bind(this.protection))
		this.on('server.close', this.onDisconnect)
		this.on('client.error', this.onDisconnect)
		this.on('client.timeout', this.onDisconnect)
	}
	listen() {
		Logger.debug('net', 'PolicyServer.listen')
		this.server.listen({
			port: this.options.port ?? 843,
			host: this.options.host ?? '0.0.0.0'
		})
	}
	close() {
		Logger.debug('net', 'PolicyServer.close')
		this.server.close()
		for(let client of this.clients)
			client.close()
	}
	onConnect(server, socket) {
		Logger.debug('net', 'PolicyServer.onConnect')
		let client = new PolicyServerClient(this.options, socket, this.policyData)
		client.onAny((event, client, ...args) => this.emit(event, client, ...args))
		this.clients.push(client)
		if(this.options.manualOpen !== true)
			client.open()
		client.emit('client.connect')
	}
	onDisconnect(server, client) {
		Logger.debug('net', 'PolicyServer.onDisconnect')
		this.clients = this.clients.filter(e => e.socket.readyState !== 'closed')
	}
}

module.exports = {
	PolicyServer: PolicyServer,
	PolicyServerClient: PolicyServerClient
}