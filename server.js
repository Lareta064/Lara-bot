import axios from 'axios'
import {
    VK,
    Keyboard
} from 'vk-io'
import config from 'config'
const vk = new VK({
    token: config.get('vk.group.token')
})

vk.updates.use(async (context, next) => {
    if (context.is('message') && !context.isOutbox && context.hasText) {
        await next()
    }
})
vk.updates.use(async (context, next) => {

    // const valutes = await getValutes()
    const {
        messagePayload
    } = context
    if (messagePayload) {
        const charCode = messagePayload.cc
        const valutes = await getValutes()
        const valute = valutes[charCode]

        await context.send(`${valute.Nominal} ${valute.Name} стоит ${valute.Value} рублей`)
    } else {

    }

    await context.send('Выбирай валюту, чтобы узнать курс', {
        keyboard: await valuteKeyboard()
    })
})
vk.updates.startPolling()
    .then(() => console.log('Start server', new Date))

const apiUrl = 'https://www.cbr-xml-daily.ru/daily_json.js'

axios.get(apiUrl)
    .then(result => console.log(result.data))

function getValutes() {
    return new Promise(async (resolve, reject) => {
        try {
            const {
                data
            } = await axios.get(apiUrl).catch(err => reject(err))
            resolve(data.Valute)

        } catch (err) {
            reject(err)
        }
    })
}

function valuteKeyboard() {
    return new Promise(async (resolve, reject) => {
        const valutes = await getValutes()
        const keys = Object.keys(valutes)

        let builder = Keyboard.builder()

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            const valute = valutes[key]

            if (i > 0 && (i % 4 === 0)) {
                builder = builder.row()
            }

            builder = builder.textButton({
                label: valute.CharCode,
                color: Keyboard.POSITIVE_COLOR,
                payload: {
                    cc: valute.CharCode
                }
            })
        }
        resolve(builder.oneTime())
    })

}