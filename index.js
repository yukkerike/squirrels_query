const express = require('express')
const hbs = require("hbs");
const rateLimit = require('express-rate-limit')
const {
    executeAndWait,
    composeLogin,
    createClient,
    experienceToLevel,
    shamanExperienceToLevel
} = require('./helpers')
const path = require('path')

const app = express()
const port = 3000 || process.env.PORT
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
})
app.use(limiter)
app.set("view engine", "hbs")
hbs.registerPartials(path.join(__dirname, "views", "partials"));
hbs.registerHelper("inc", function (value, options) { return parseInt(value) + 1 });
app.set('views', path.join(__dirname, "views"));

const token = process.env.TOKEN
let client = null
login(token)

app.get('/', async (req, res) => {
    res.render("index")
});

app.get('/manifest.json', (req, res) => {
    res.sendFile(path.join(__dirname, "manifest.json"))
})

app.get('/sw.js', (req, res) => {
    res.sendFile(path.join(__dirname, "sw.js"))
})

app.get('/user/:userId', async (req, res) => {
    const userId = req.params.userId
    if (req.query.json === "") {
        const data = await getUser(userId, 4190175)
        res.json(data)
        return
    }
    const mask = 4 | 8 | 16 | 64 | 128 | 256 | 1024 | 4096 | 16384 | 65536
    const data = await getUser(userId, mask)
    if (data === null) {
        res.send('User not found')
        return
    } else {
        let bdate = new Date(data.person_info.bdate * 1000)
        bdate = `${bdate.getUTCDate()}.${bdate.getUTCMonth() + 1}.${bdate.getUTCFullYear()}`
        res.render("user", {
            uid: data.uid,
            name: data.name,
            level: data.level,
            shaman_level: data.shaman_level,
            moderator: data.moderator ? "Да" : "Нет",
            online: data.online ? "Да" : "Нет",
            sex: data.sex == 1 ? "Женский" : "Мужской",
            clan_id: data.clan_id,
            is_gone: data.is_gone ? "Да" : "Нет",
            profile: data.person_info.profile,
            bdate: bdate,
            vip_exist: data.vip_info.vip_exist ? "Да" : "Нет",
            exp: data.exp,
            shaman_exp: data.shaman_exp,
        })
    }
});

app.get('/clan/:clanId', async (req, res) => {
    const clanId = req.params.clanId
    if (req.query.json === "") {
        const clan = await getClan(clanId, 65535)
        res.json(clan)
        return
    }
    const clan = await getClan(clanId)
    if (clan === null) {
        res.send('Clan not found')
        return
    }
    res.render("clan", {
        id: clan.id,
        info: clan.info,
        news: clan.news,
        leader_id: clan.leader_id,
        rank: clan.rank,
        ban: clan.ban ? "Да" : "Нет",
        level_limiter: clan.level_limiter,
        members: clan.members,
        blacklist: clan.blacklist,
        statistics: clan.statistics,
        count: {
            members: clan.members.length,
            blacklist: clan.blacklist ? clan.blacklist.length : 0
        }
    })
});

app.get('*', (req, res) => {
    res.redirect('/')
})

app.listen(port, () => console.log(`Сервер запущен на порте ${port}`))

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
        console.log(e)
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
        if (data.name === "") data[i].name = "Без имени"
        return data
    } catch (e) {
        console.log(e)
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
                return packet.type === 'PacketClanInfo' && packet.data.data.length !==0 && packet.data.data[0].id === parseInt(clanId) 
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
        for (let i = 0; i < data.statistics.length; i++) {
            enhanced_uid = data.members.find(member => member.uid === data.statistics[i].uid)
            data.statistics[i].uid = enhanced_uid ? enhanced_uid : { uid: data.statistics[i].uid, name: "Покинул клан" }
            data.rank.dailyPlayerExp += data.statistics[i].samples
        }
        data.statistics.sort((a, b) => b.exp - a.exp)
        if (data.blacklist)
            data.blacklist = await getUser(data.blacklist, 8 | 256 | 1024)
        return data
    } catch (e) {
        console.log(e)
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
    const handleClose = function (client) {
        console.log('Client closed')
        client = login(token)
    }
    client.on('client.connect', () => handleConnect(client))
    client.on('packet.incoming', (packet, buffer) => handlePacket(client, packet, buffer))
    client.on('client.close', () => handleClose(client))
    client.open()
}
