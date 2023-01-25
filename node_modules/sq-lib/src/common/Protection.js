//  Module:     Protection
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

const max = Math.max

class Protection {
	constructor(server) {
		this.onConnect = server.onConnect.bind(server)
		this.socketsByIp = server.socketsByIp = {}
		this.closeNew = server.options.maxConnsPerIpCloseNew
		this.maxConns = server.options.maxConnsPerIp
	}
	onConnect(server, socket) {
		let ip = socket.address().address
		let conns = this.socketsByIp[ip] = this.socketsByIp[ip] ?? []
		let closed = this.closeExcessConns(conns, socket, ip)
		if(closed == 0) {
			this.server.onConnect(server, socket)
		} else {
			if(!this.closeNew) {
				this.server.onConnect(server, socket)
			} else {
				socket.destroy()
				this.server.emit('client.fail', ip, new Error('"maxConnsPerIp" limit exceeded!'))
			}
			this.socketsByIp[ip] = this.socketsByIp[ip].filter(e => e.readyState !== 'closed')
			if(conns.length === 0)
				delete this.socketsByIp[ip]
		}
	}
	closeExcessConns(socket, ip) {
		conns.push(socket)
		let closed = this.socketsByIp[ip].length - this.maxConns
		for(let i = 0; i < closed; i++) {
			socket.destroy()
			this.server.emit('client.fail', ip, new Error('"maxConnsPerIp" limit exceeded!'))
		}
		return max(closed, 0)
	}
}

module.exports = {
	Protection: Protection
}