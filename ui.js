import express from 'express'
const hbs = require("./node_modules/hbs/lib/hbs.js")
import { join } from 'path'
import { getUser, getClan } from './gameClient.js'
import { fileURLToPath } from 'url'
const __dirname = fileURLToPath(new URL('.', import.meta.url))

const app = express()
app.set("view engine", "hbs")
hbs.registerPartials(join(__dirname, "views", "partials"));
hbs.registerHelper("inc", function (value, options) { return parseInt(value) + 1 });
app.set('views', join(__dirname, "views"));

app.get('/', async (req, res) => {
    res.render("index")
});

app.get('/manifest.json', (req, res) => {
    res.sendFile(join(__dirname, "manifest.json"))
})

app.get('/main.css', (req, res) => {
    res.sendFile(join(__dirname, "main.css"))
})

app.get('/sw.js', (req, res) => {
    res.sendFile(join(__dirname, "sw.js"))
})

app.get('/user', (req, res) => {
    res.redirect(`/user/${req.query.uid}`)
})

app.get('/user/:userId', async (req, res) => {
    const userId = req.params.userId
    console.log("/user/" + userId + (req.query.json === "" && ".json"))
    if (req.query.json === "") {
        const data = await getUser(userId, 4190175)
        res.json(data)
        return
    }
    const mask = 4 | 8 | 16 | 64 | 128 | 256 | 1024 | 4096 | 16384 | 65536
    const data = await getUser(userId, mask)
    if (data === null) {
        res.status(404)
        res.send(`<html><head><meta http-equiv="refresh" content="2;url=/"></head><body>User not found</body></html>`)
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

app.get('/clan', (req, res) => {
    res.redirect(`/clan/${req.query.id}`)
})

app.get('/clan/:clanId', async (req, res) => {
    const clanId = req.params.clanId
    console.log("/clan/" + clanId + (req.query.json === "" && ".json"))
    if (req.query.json === "") {
        const clan = await getClan(clanId, 65535)
        res.json(clan)
        return
    }
    const clan = await getClan(clanId)
    if (clan === null) {
        res.status(404)
        res.send(`<html><head><meta http-equiv="refresh" content="2;url=/"></head><body>Clan not found</body></html>`)
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

export default app
