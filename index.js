// basic express server
const express = require('express')
const {
    waitForResult,
    executeAndWait,
    composeLogin,
    createClient,
    experienceToLevel,
    shamanExperienceToLevel
} = require('./helpers')

const app = express()
const port = 3000
const token = ''
let client = null
login(token)

app.get('/', async (req, res) => {
    // const client = login(token)
    res.send("test")
});

app.get('/user/:userId', async (req, res) => {
    // get user info from query
    const userId = req.params.userId
    const data = await getUser(userId)
    if (data === null) {
        res.send('User not found')
    } else {
        res.send(data)
    }
});

app.get('/clan/:leaderId', async (req, res) => {
    // get user info from query
    const leaderId = req.params.leaderId
    let data = await getUser(leaderId)
    const clanId = data.clan_id
    const clan = await getClan(clanId)
    res.send(clan)
});

app.listen(port, () => console.log(`Сервер запущен на порте ${port}`))

async function getUser(uid) {
    const mask = 0 | 4 | 8 | 16 | 128 | 256 | 1024 | 65536
    try {
        let data = await executeAndWait(
            client,
            () => client.sendData('REQUEST', [[uid]], mask),
            'packet.incoming',
            'PacketInfo',
            1000)
        data = data.data.data[0]
        data.level = experienceToLevel(data.exp)
        data.shamanLevel = shamanExperienceToLevel(data.shaman_exp)
        return data
    } catch (e) {
        return null
    }
}

async function getClan(clanId) {
    try {
        let data = await executeAndWait(
            client,
            () => client.sendData('CLAN_REQUEST', [[clanId]], 32767),
            'packet.incoming',
            'PacketClanInfo',
            1000)
        return data
    } catch (e) {
        return null
    }
}

function login(token) {
    client = createClient('88.212.206.137', ['11111', '11211', '11311'])
    client.setMaxListeners(0)
    const handlePacket = function(client, packet, buffer) {
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
    }
    const handleClose = function (client) {
        console.log('Client closed')
        client = login(token)
    }
    client.on('client.connect', () => handleConnect(client))
    client.on('packet.incoming', (packet, buffer) => handlePacket(client, packet, buffer))
    client.on('client.close', () => handleClose(client))
    client.open()
}
