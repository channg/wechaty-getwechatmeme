const { Wechaty } = require('wechaty')
let createQrcode = require('./getpy.js')
const { ScanStatus } = require('wechaty-puppet')
const QrcodeTerminal = require('qrcode-terminal')
const { FileBox } = require('file-box')

var rp = require('request-promise');


const parseString = require('xml2js').parseString;

const token = 'puppet_donut_49cdffa1c2ceb3ab'

const bot = new Wechaty({
    puppet: 'wechaty-puppet-hostie',
    puppetOptions: {
        token,
    }
});

let um = {}
let miaoshu = 20
bot
    .on('scan', (qrcode, status) => {
        if (status === ScanStatus.Waiting) {
            QrcodeTerminal.generate(qrcode, {
                small: true
            })
        }
    })
    .on('login', async user => {
        console.log(`user: ${JSON.stringify(user)}`)
    })
    .on('message', async msg => {
        if (msg.self()) {
            // Don't deal with message from yourself.
            return
        }

        console.log(JSON.stringify(msg))
        console.log(msg.payload.fromId)

        let is_e = false
        const contact = msg.from()
        if (contact && msg.payload.text) {
            let xml = msg.payload.text;
            let pr = new Promise((resolve, reject) => {
                parseString(xml, function (err, result) {
                    if (result && result.msg && result.msg.emoji && result.msg.emoji) {
                        if (result.msg.emoji.length && result.msg.emoji.length > 0) {
                            if (result.msg.emoji[0].$ && result.msg.emoji[0].$.cdnurl) {
                                is_e = true
                            }
                        }
                    }
                    if (is_e) {
                        resolve(result.msg.emoji[0].$.cdnurl)
                    } else {
                        try {
                            if (result.msg.appmsg[0].type[0] === '8') {
                                contact.say('这张图片是分享图片，请删除后再添加，然后在发送')
                                reject()
                            }
                        } catch (err) {
                            reject('1')
                        }
                    }
                });
            })
            let url
            try {
                url = await pr

                try {
                    let user = msg.payload.fromId
                    var timestamp = Date.parse(new Date()) / 1000
                    if (um[user]) {
                        if (timestamp - um[user] > miaoshu) {
                            um[user] = timestamp
                        } else {
                            let contact = msg.from()
                            contact.say((miaoshu - (timestamp - um[user])) + '秒后可以继续使用')
                            return
                        }
                    } else {
                        um[user] = timestamp
                    }
                } catch (err) {
                    return
                }

                //url = url.replace('http://vweixinf.tc.qq.com', 'https://xxxxxxx')
                contact.say(url)

            } catch (err) {
                if (err === '1') {
                    await contact.say('我现在只会下载表情包~给我发送表情包就行了~')
                }
            }
        }
    })
    .on('friendship', async friendship => {
        console.log(JSON.stringify(friendship))
        friendship.accept().catch(async (err) => {
            console.log(err)
        })
    })
    .start()













