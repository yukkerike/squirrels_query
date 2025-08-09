import express from 'express'
const hbs = require("./node_modules/hbs/lib/hbs.js")
import { join } from 'path'
import { getUser, getClan } from './gameClient.js'
import { fileURLToPath } from 'url'
const __dirname = fileURLToPath(new URL('.', import.meta.url))
const id_regex = /\d+/gm
const app = express()
app.set("view engine", "hbs")
hbs.registerPartials(join(__dirname, "views", "partials"));
hbs.registerHelper("inc", function (value, options) { return parseInt(value) + 1 });
app.set('views', join(__dirname, "views"));

app.get('/', async (req, res) => {
    res.render("index")
})

app.get('/main.css', (req, res) => {
    res.sendFile(join(__dirname, "main.css"))
})

app.get('/user', (req, res) => {
    res.redirect(`/user/${req.query.uid}`)
})

app.get('/user/:userId', async (req, res) => {
    const userId = req.params.userId?.match(id_regex)?.join("")
    if (!userId) {
        res.redirect(`/`)
        return
    }
    console.log("/user/" + req.params.userId)
    if (req.query.json === "" || req.params.userId?.endsWith(".json")) {
        const data = await getUser(userId, 4194303)
        res.json(data)
        return
    }
    if (userId !== req.params.userId) {
        res.redirect(`/user/${userId}`)
        return
    }
    const mask = 4 | 8 | 16 | 64 | 128 | 256 | 1024 | 4096 | 16384 | 65536
    const data = await getUser(userId, mask)
    if (data === null) {
        res.status(404)
        res.send(`<html><head><meta http-equiv="refresh" content="2;url=/"></head><body>User not found</body></html>`)
        return
    } else {
        let bdate = data.person_info?.bdate ? new Date(data.person_info.bdate * 1000) : null
        bdate = bdate ? `${bdate.getUTCDate()}.${bdate.getUTCMonth() + 1}.${bdate.getUTCFullYear()}` : '—'
        const levelProgress = data.level / 2
        const shamanLevelProgress = data.shaman_level / 51 * 100
        console.log(data.name + '\n')
        res.render("user", {
            uid: data.uid,
            name: data.name,
            level: data.level,
            shaman_level: data.shaman_level,
            moderator: !!data.moderator,
            online: !!data.online,
            sex: data.sex == 1 ? "Женский" : "Мужской",
            clan_id: data.clan_id,
            profile: data.person_info?.profile,
            bdate: bdate,
            vip_exist: !!data.vip_info?.vip_exist,
            exp: data.exp,
            shaman_exp: data.shaman_exp,
            level_progress: levelProgress,
            shaman_level_progress: shamanLevelProgress,
        })
    }
})

app.get('/clan', (req, res) => {
    res.redirect(`/clan/${req.query.id}`)
})

app.get('/clan/:clanId', async (req, res) => {
    const clanId = req.params.clanId?.match(id_regex)?.join("")
    if (!clanId) {
        res.redirect(`/`)
        return
    }
    console.log("/clan/" + req.params.clanId)
    if (req.query.json === "" || req.params.clanId?.endsWith(".json")) {
        const clan = await getClan(clanId, 262143)
        res.json(clan)
        return
    }
    if (clanId !== req.params.clanId) {
        res.redirect(`/clan/${clanId}`)
        return
    }
    const clan = await getClan(clanId)
    if (clan === null) {
        res.status(404)
        res.send(`<html><head><meta http-equiv="refresh" content="2;url=/"></head><body>Clan not found</body></html>`)
        return
    }
    console.log(clan.info.name + '\n')
    res.render("clan", {
        id: clan.id,
        info: clan.info,
        news: clan.news,
        leader_id: clan.leader_id,
        rank: clan.rank,
        ban: !!clan.ban,
        level_limiter: clan.level_limiter,
        rating_score: clan.rating_info,
        members: clan.members,
        blacklist: clan.blacklist,
        statistics: clan.statistics,
        count: {
            members: clan.members.length,
            blacklist: clan.blacklist ? clan.blacklist.length : 0
        }
    })
})
app.get('*', (req, res) => {
    res.redirect('/')
})

export default app
