//  Module:     tests
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

const equal = require('fast-deep-equal')
const { Logger, PacketClient, PacketServer, GameClient, GameServer, PolicyServer } = require('../index.js')

const log = Logger.info
Logger.setOptions({logFile: 0, debug: 0, info: 1, warn: 1, error: 1, fatal: 1})

function clear() {
    console.clear()
    process.stdout.write('\033c')
}

async function pause() {
    return new Promise((resolve) => {
        process.stdin.setRawMode(true)
        process.stdin.resume()
        process.stdin.on('data', () => {
            resolve()
        })
    })
}

async function hello() {
    log('main', 'Добро пожаловать в тестирование sq-lib!\r\n\
    Данный скрипт поможет вам протестировать работу библиотеки.\r\n\
    Вам будет предложено выполнить несколько действий.\r\n\
    \r\n\
    Нажмите любую клавишу для продолжения..\r\n')
    await pause()
}

async function stepOne() {
    clear()
    log('main', 'Тест #1\r\n\
    Сейчас будет создан тестовый пакет клиента.\r\n\
    Данный пакет будет сконвертирован в байтовое представление и обратно.\r\n\
    \r\n\
    Цель теста: проверка работы путём обратимости.\r\n\
    Использованные классы: PacketClient.\r\n\
    \r\n\
    Нажмите любую клавишу для продолжения..\r\n')
    await pause()
    let packet = new PacketClient('LOGIN', BigInt(0), 1, 2, '#3', 4, 5, 'optional #6')
    let buffer = packet.toBuffer()
    log('main', 'Пакет:\r\n', packet, '\r\n')
    log('main', 'Байты:\r\n', buffer, '\r\n')
    let packet2 = PacketClient.from(buffer)
    packet2.data[0] = packet2.data[0].valueOf()
    let buffer2 = packet2.toBuffer()
    log('main', 'Пакет:\r\n', packet2, '\r\n')
    log('main', 'Байты:\r\n', buffer2, '\r\n')
    log('main', 'Пакеты совпадают:\r\n', equal(packet, packet2) ? 'ДА' : 'НЕТ', '\r\n')
    log('main', 'Байты совпадают:\r\n', equal(buffer, buffer2) ? 'ДА' : 'НЕТ', '\r\n')
    log('main', 'Нажмите любую клавишу для продолжения..\r\n')
    await pause()
}

async function stepTwo() {
    clear()
    log('main', 'Тест #2\r\n\
    Сейчас будет создан тестовый пакет сервера.\r\n\
    Данный пакет будет сконвертирован в байтовое представление и обратно.\r\n\
    \r\n\
    Цель теста: проверка работы путём обратимости.\r\n\
    Использованные классы: PacketServer.\r\n\
    \r\n\
    Нажмите любую клавишу для продолжения..\r\n')
    await pause()
    let packet = new PacketServer(
        'PacketLogin', 
        {
            "status": 0,
            "innerId": 1,
            "unixTime": 2,
            "tag": 3,
            "canOffer": 4,
            "advertising": 5,
            "email": "#6"
        }
    )
    let buffer = packet.toBuffer()
    log('main', 'Пакет:\r\n', packet, '\r\n')
    log('main', 'Байты:\r\n', buffer, '\r\n')
    let packet2 = PacketServer.from(buffer)
    for(key of Object.keys(packet2.data))
        if(packet2.data[key] === undefined)
            delete packet2.data[key]
    let buffer2 = packet2.toBuffer()
    log('main', 'Пакет:\r\n', packet2, '\r\n')
    log('main', 'Байты:\r\n', buffer2, '\r\n')
    log('main', 'Пакеты совпадают:\r\n', equal(packet, packet2) ? 'ДА' : 'НЕТ', '\r\n')
    log('main', 'Байты совпадают:\r\n', equal(buffer, buffer2) ? 'ДА' : 'НЕТ', '\r\n')
    log('main', 'Нажмите любую клавишу для продолжения..\r\n')
    await pause()
}

async function stepThree() {
    clear()
    let resolve
    log('main', 'Тест #3\r\n\
    Сейчас будет создан тестовый сервер-сниффер.\r\n\
    Вам необходимо зайти на сервер и войти в игру.\r\n\
    \r\n\
    Цель теста: проверка работы.\r\n\
    Использованные классы: GameServer, GameClient, PolicyServer.\r\n\
    \r\n\
    Нажмите любую клавишу для продолжения..\r\n')
    await pause()
    let policyServer = new PolicyServer({
        port: 843,
        host: '0.0.0.0',
        allowedPorts: [ 
            11111,
            11211,
            11311
        ]
    })
    policyServer.on('server.listening', () => {
        log('main', `Сервер политики работает на ${policyServer.options.host}:${policyServer.options.port}`)
    })
    policyServer.listen()
    let server = new GameServer({
        port: [
            11111, 
            11211, 
            11311
        ],
        host: '0.0.0.0',
        manualOpen: true
    })
    server.on('server.listening', (server) => log('main', `Сервер работает на ${server.address().address}:${server.address().port}`))
    server.on('client.connect', (client) => {
        let proxy = new GameClient({
            'port': 11111,
            'host': '88.212.206.137'
        })
        proxy.on('client.connect', () => client.open())
        proxy.on('client.close', () => client.close())
        proxy.on('client.error', (error) => client.close())
        proxy.on('client.timeout', () => client.close())
        proxy.on('packet.incoming', (packet, buffer) => {
            switch(packet.type) {
                case 'PacketLogin':
                    client.uid = packet.data.innerId
                    break
                case 'PacketInfo':
                    for(player of packet.data.data) {
                        if(player.uid !== client.uid)
                            continue
                        if('name' in player)
                            client.name = player.name
                        if(!('moderator' in player))
                            continue
                        player.moderator = 1
                        break
                    }
                    break
                case 'PacketChatHistory':
                    if(client.sentMessage)
                        break
                    client.sentMessage = true
                    log('main', `\r\nВы вошли в игру как "${client.name}". Теперь отправьте любое сообщение в чат.`)
                    client.sendData('PacketAdminMessage', {
                        'message': `Вы вошли в игру как "${client.name}". Теперь отправьте любое сообщение в чат.`
                    })
            }
            client.sendPacket(packet)
        })
        client.proxy = proxy
        proxy.open()
    })
    server.on('packet.incoming', async (client, packet) => {
        switch(packet.type) {
            case 'CHAT_MESSAGE':
                log('main', `Вы написали в чат "${packet.data[1]}". Тест пройден.\r\n\r\nНажмите любую клавишу для продолжения..\r\n`)
                server.close()
                await pause()
                resolve()
                return
        }
        client.proxy.sendPacket(packet)
    })
    server.on('client.close', (client) => client.proxy.close())
    server.on('client.error', (client, error) => client.proxy.close())
    server.on('client.timeout', (client) => client.proxy.close())
    server.listen()
    return new Promise((r) => {
        resolve = r
    })
}

async function stepFour() {
    clear()
    log('main', 'Тесты пройдены\r\n\
    Вы успешно завершили все тесты sq-lib.\r\n\
    \r\n\
    Нажмите любую клавишу для продолжения..\r\n')
    await pause()
}

(async() => {
    await hello()
    await stepOne()
    await stepTwo()
    await stepThree()
    await stepFour()
    process.exit()
})()

