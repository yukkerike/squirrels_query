//  Module:     PacketUtil
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

const { PlayerInfoParser } = require('@sq-lib/common/utils/PlayerInfoParser')
const { ClanInfoParser } = require('@sq-lib/common/utils/ClanInfoParser')

class PacketUtil {
	static read(packet) {
		let {type, data} = packet
		if(type === 'PacketInfo' || type === 'PacketInfoNet')
			data.data = PlayerInfoParser.read(data.data, data.mask)
		else if(type === 'PacketClanInfo')
			data.data = ClanInfoParser.read(data.data, data.mask)
		return packet
	}
	static write(packet) {
		let {type, data} = packet
		if(type === 'PacketInfo' || type === 'PacketInfoNet')
			data.data = PlayerInfoParser.write(data.data)
		else if(type === 'PacketClanInfo')
			data.data = ClanInfoParser.write(data.data)
		return packet
	}
}

module.exports = {
	PacketUtil: PacketUtil
}