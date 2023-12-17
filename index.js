import app from './ui.js'

let port = [process.env.PORT || 3000]
app.listen(...port, () => console.log(`Сервер запущен на порте ${port}`))

process.on('uncaughtException', (err, origin) => {
    console.error(
        `Исключение: ${err}\n` +
        `Источник: ${origin}`,
    )
})

process.on('SIGINT', function () {
    console.log("Завершение работы...")
    process.exit()
})