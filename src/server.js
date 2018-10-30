require('dotenv').config()
const http = require('http')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer')

class SMTP {
    start (host, port, user, pass) {
        const poolConfig = {
            pool: false,
            host, port,
            secure: true, // use TLS
            auth: { user, pass },
            debug: process.env.SMTP_DEBUG === 'true' ? true : false
        }
        // console.log(poolConfig)
        this._transporter = nodemailer.createTransport(poolConfig)
    }
    stop() {
        if(this._transporter) {
            this._transporter.close()
        }
    }

    async send (message) {
        let response = null
        let error = null
        try {
            response = await this._transporter.sendMail(message)
        } catch (e) {
            error = e
        }

        return { response, error }
    }
}

const smtp = new SMTP()
const app = express()
app.set('port', process.env.PORT || 5000)
app.use(cors())
app.use(bodyParser.json())
app.post('/api/mail', async function (req, res) {
    let { subject, name, email, message } = req.body
    const striptags = str => str.replace(/<(.|\n)*?>/g, '')
    name = striptags(name)
    email = striptags(email)
    message = striptags(message)
    subject = striptags(subject)

    const mail = {
        from: process.env.SMTP_LOGIN,
        to: process.env.TO,
        subject,
        html: `<p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p>${message}</p>`,
    }

    res.json(await smtp.send(mail))
})

smtp.start(process.env.SMTP_SERVER, process.env.SMTP_PORT, process.env.SMTP_LOGIN, process.env.SMTP_PASSWORD)
const server = http.createServer(app)
server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'))
})
smtp.stop()
