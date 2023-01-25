//  Module:     Dissector
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

const { ProtocolData } = require('@sq-lib/shared/ProtocolData')

const DissectorStates = {
	HEADER: 0,
	PAYLOAD: 1
}

class Dissector {
	constructor() {
		this.header = Buffer.allocUnsafe(ProtocolData.PACKET_HEADER_SIZE)
		this.buffer = null
		this.reset()
	}
	reset() {
		this.state = DissectorStates.HEADER
		this.bytesRead = 0x0
	}
	read(chunk) {
		this.bytesRead += chunk.byteLength
		switch(this.state) {
			case DissectorStates.HEADER:
				let added = chunk.copy(this.header, this.bytesRead - chunk.byteLength, 0)
				if(this.bytesRead < ProtocolData.PACKET_HEADER_SIZE)
					return {}
				let length = this.header.readUInt32LE(0)
				if(length > ProtocolData.PACKET_MAX_SIZE)
					throw new Error(`too big packet size: ${length}`)
				this.state = DissectorStates.PAYLOAD
				this.buffer = Buffer.allocUnsafe(length + ProtocolData.PACKET_HEADER_SIZE)
				this.buffer.writeUInt32LE(length)
				if(this.bytesRead === ProtocolData.PACKET_HEADER_SIZE)
					return {}
				chunk = chunk.slice(added)
			case DissectorStates.PAYLOAD:
				let remainder = this.bytesRead - this.buffer.byteLength
				chunk.copy(this.buffer, this.bytesRead - chunk.byteLength, 0, chunk.byteLength - Math.max(remainder, 0))
				if(remainder < 0)
					return {}
				this.reset()
				if(remainder == 0)
					return {buffer: this.buffer}
				return {
					buffer: this.buffer,
					remainder: chunk.slice(chunk.length - remainder)
				}
			default:
				throw new Error(`unknown state: ${this.state}`)
		}
	}
}

module.exports = {
	Dissector: Dissector
}