//  Module:     ClanInfoParser
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

const { InfoParser } = require('@sq-lib/common/utils/InfoParser')
const { ClanInfoData } = require('@sq-lib/shared/ClanInfoData')

const ClanInfoParser = new InfoParser(ClanInfoData)

module.exports = {
	ClanInfoParser: ClanInfoParser
}