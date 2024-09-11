import { executeAndWait, composeLogin, createClient, experienceToLevel, shamanExperienceToLevel } from './helpers/index.js'

const token = process.env.TOKEN
let client = null
login(token)

async function getUsers(uids, mask) {
    try {
        uids = uids.map(uid => [uid])
        let data = await executeAndWait(
            client,
            () => client.sendData('REQUEST', uids, mask),
            'packet.incoming',
            packet => packet.type === 'PacketInfo' && packet.data.data.length === uids.length,
            1000)
        data = data.data.data
        for (let i = 0; i < data.length; i++) {
            if (data[i].exp !== undefined) data[i].level = experienceToLevel(data[i].exp)
            if (data[i].shaman_exp !== undefined) data[i].shaman_level = shamanExperienceToLevel(data[i].shaman_exp)
            if (data[i].name === "") data[i].name = "Без имени"
        }
        return data
    } catch (e) {
        console.error(e)
        return null
    }
}

async function getUser(uid, mask) {
    try {
        if (Array.isArray(uid)) return await getUsers(uid, mask)
        let data = await executeAndWait(
            client,
            () => client.sendData('REQUEST', [[uid]], mask),
            'packet.incoming',
            packet => packet.type === 'PacketInfo' && packet.data.data[0].uid === parseInt(uid),
            1000)
        data = data.data.data[0]
        if (data.exp !== undefined) data.level = experienceToLevel(data.exp)
        if (data.shaman_exp !== undefined) data.shaman_level = shamanExperienceToLevel(data.shaman_exp)
        if (data.name === "") data.name = "Без имени"
        return data
    } catch (e) {
        console.error(e)
        return null
    }
}

async function getClan(clanId, mask) {
    mask = mask || 1 | 2 | 4 | 32 | 256 | 4096 | 8192 | 16384
    try {
        let data = await executeAndWait(
            client,
            () => client.sendData('CLAN_REQUEST', [[clanId]], mask),
            'packet.incoming',
            function (packet) {
                return packet.type === 'PacketClanInfo' && packet.data.data.length !== 0 && packet.data.data[0].id === parseInt(clanId)
            },
            1000)
        data = data.data.data[0]
        let members = await executeAndWait(
            client,
            () => client.sendData('CLAN_GET_MEMBERS', clanId),
            'packet.incoming',
            function (packet) {
                return packet.type === 'PacketClanMembers' && packet.data.clanId === parseInt(clanId)
            },
            1000)
        data.leader_id = await getUser(data.leader_id, 8 | 256 | 1024)
        data.members = members.data.playerIds
        data.members = await getUser(data.members, 8 | 256 | 1024)
        data.rank.dailyPlayerExp = 0
        data.rank.dailyTotalExp = 0
        for (let i = 0; i < data.statistics.length; i++) {
            data.statistics[i].uid = data.members.find(member => member.uid === data.statistics[i].uid) 
                || 
                { 
                    uid: data.statistics[i].uid, 
                    name: "Покинул клан" 
                }
            data.rank.dailyPlayerExp += data.statistics[i].samples
            data.rank.dailyTotalExp += data.statistics[i].exp
        }
        data.statistics.sort((a, b) => b.exp - a.exp)
        if (data.blacklist)
            data.blacklist = await getUser(data.blacklist, 8 | 256 | 1024)
        return data
    } catch (e) {
        console.error(e)
        return null
    }
}

function login(token) {
    client = createClient('88.212.206.137', ['11111', '11211', '11311'])
    client.setMaxListeners(0)
    const handlePacket = function (client, packet, buffer) {
        switch (packet.type) {
            case 'PacketGuard':
                client.sendData('GUARD', [])
                break
            default:
                break
        }
    }
    const handleConnect = async function (client) {
        client.sendData('HELLO')
        let login = { data: { status: 2 } }
        while (login.data.status === 2) {
            login = await executeAndWait(
                client,
                () => client.sendData('LOGIN', ...composeLogin(token)),
                'packet.incoming',
                'PacketLogin',
                1000)
        }
        if (login.data.status !== 0) client.close()
        client.sendData('AB_GUI_ACTION', 0)
        setInterval(() => {
            client.sendData('PING', 0)
        }, 30000)
    }
    client.on('client.connect', () => handleConnect(client))
    client.on('packet.incoming', (packet, buffer) => handlePacket(client, packet, buffer))
    client.on('client.close', () => {
        console.error('Client closed')
        process.exit()
    })
    console.log('Подключаемся к серверу...')
    client.open()
}

export { getUser, getClan }
