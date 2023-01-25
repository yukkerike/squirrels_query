//  Module:     PacketClient
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

const { ProtocolData } = require('@sq-lib/shared/ProtocolData')
const { ProtoDefCompiler, CompiledProtodef } = require('protodef').Compiler

const Compiler = new ProtoDefCompiler()
const ProtocolClient = new CompiledProtodef(
	Compiler.sizeOfCompiler.compile(ProtocolData.client.sizeOfCode),
	Compiler.writeCompiler.compile(ProtocolData.client.writeCode),
	Compiler.readCompiler.compile(ProtocolData.client.readCode)
)

class PacketClient {
	constructor(type, ...data) {
		if(type === undefined)
			return
		this.length = undefined
		this.id = 0
		this.type = type
		this.data = data
	}
	toBuffer() {
		let buffer = ProtocolClient.createPacketBuffer('packet', this)
		this.length = buffer.byteLength - 4
		buffer.writeUInt32LE(this.length, 0)
		return buffer
	}
	static from(buffer) {
		let data = ProtocolClient.parsePacketBuffer('packet', buffer).data
		let packet = new this()
		packet.length = buffer.byteLength - 4
		packet.id = data.id
		packet.type = data.type
		packet.data = data.data
		return packet
	}
}

module.exports = {
	ProtocolClient: ProtocolClient,
	PacketClient: PacketClient
}