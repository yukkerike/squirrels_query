//  Module:     PacketServer
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

const { ProtocolData } = require('@sq-lib/shared/ProtocolData')
const { InfoParser } = require('@sq-lib/common/utils/InfoParser')
const { PacketUtil } = require('@sq-lib/common/utils/PacketUtil')
const { ProtoDefCompiler, CompiledProtodef } = require('protodef').Compiler

const Compiler = new ProtoDefCompiler()
const ProtocolServer = new CompiledProtodef(
	Compiler.sizeOfCompiler.compile(ProtocolData.server.sizeOfCode),
	Compiler.writeCompiler.compile(ProtocolData.server.writeCode),
	Compiler.readCompiler.compile(ProtocolData.server.readCode)
)

InfoParser.primitives = ProtocolServer

class PacketServer {
	constructor(type, data) {
		if(type === undefined) 
			return
		this.length = undefined
		this.type = type
		this.data = data
	}
	toBuffer() {
		let buffer = ProtocolServer.createPacketBuffer('packet', PacketUtil.write(this))
		this.length = buffer.byteLength - 4
		buffer.writeUInt32LE(this.length, 0)
		return buffer
	}
	static from(buffer) {
		let data = PacketUtil.read(ProtocolServer.parsePacketBuffer('packet', buffer).data)
		let packet = new this()
		packet.length = buffer.byteLength - 4
		packet.type = data.type
		packet.data = data.data
		return packet
	}
}

module.exports = {
	ProtocolServer: ProtocolServer,
	PacketServer: PacketServer
}