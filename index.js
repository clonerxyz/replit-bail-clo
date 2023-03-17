"use strict";
const { default:makeWASocket, AnyMessageContent, MessageType, delay, downloadMediaMessage, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore, MessageRetryMap, useMultiFileAuthState } = require('@adiwajshing/baileys');
const app = require('express')();
const { writeFile }  = require('fs/promises')
const { Boom } = require('@hapi/boom')
const MAIN_LOGGER = require('@adiwajshing/baileys/lib/Utils/logger');
//const { createSticker, StickerTypes } = require('wa-sticker-formatter')
const { exec } = require("child_process")
const pino = require('pino')
const str_replace = require('str_replace')
const fs = require('fs');
const qrimg = require('qrcode');
const path = require('path');
const d_t = new Date();
app.get('/qr/', (req, res) => {
fs.rmSync('./baileys_auth_info', { recursive: true });
const startSock = async() => {
	const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info')
	const { version, isLatest } = await fetchLatestBaileysVersion()
	const sock = makeWASocket({
		version,
		printQRInTerminal: true,
		auth: state,
		//msgRetryCounterMap,
		logger: pino({ level: 'silent', })
		
	})
sock.ev.process(
		async(events) => {
			if(events['connection.update']) {
				const update = events['connection.update']
				const { connection, lastDisconnect } = update
				if(connection === 'close') {
					if (fs.existsSync(path.resolve(__dirname, './', 'ano.png'))) 
					{ 
					  fs.unlinkSync(path.resolve(__dirname, './', 'ano.png'));
					  

					}
					if(lastDisconnect?.error?.output?.statusCode === DisconnectReason.restartRequired) {
						startSock()
					}
					if(lastDisconnect?.error?.output?.statusCode === DisconnectReason.timedOut) {
					}
				}
				else if (update.qr){
					qrimg.toFile(path.resolve(__dirname, './', 'ano.png'), update.qr);
					console.log('qr generated on web'+update.qr+'')
				}
				else if(connection === 'open') {
					res.end()
					console.log('connected')
				}
			}
			if(events['creds.update']) {
				await saveCreds()
			}
			if(events['messages.upsert']) {
				const upsert = events['messages.upsert']
				if(upsert.type === 'notify') {
					try {
					for(const msg of upsert.messages) {   
						const body = (msg.message?.extendedTextMessage?.text);
						const group = (msg.message?.conversation);
						const namez = (msg.pushName);
						const didi = (msg.key.remoteJid)
						const didix = str_replace('@s.whatsapp.net','', didi)
						const alls = (msg.message?.extendedTextMessage?.text || msg.message?.conversation || msg.message?.listResponseMessage?.title || msg.message?.imageMessage?.caption || msg.message?.videoMessage?.caption)
						const list = (msg.message?.listResponseMessage?.title);
						const stsx = (msg.message?.imageMessage?.caption || msg.message?.videoMessage?.caption);
						const sendMessageWTyping = async(msg, didi) => {
							await sock.presenceSubscribe(didi)
							await delay(500)

							await sock.sendPresenceUpdate('composing', didi)
							await delay(2000)

							await sock.sendPresenceUpdate('paused', didi)

							await sock.sendMessage(didi, msg)
						}
						fs.appendFile('log.txt', `nomor : ${didix} nama : ${namez} [pesan : ${alls}]\n`, function (err) {
						  if (err) throw err;
						  //console.log('Saved!');
						});
						console.log(`nomor : ${didix} nama : ${namez} [pesan : ${alls}]`)
						
						//const stsx = (msg.message?.videoMessage?.caption);
						if (alls?.startsWith('cl')){
							const txt = (alls?.split("|")[1])
							const it = (alls?.split("|")[2])
							//console.log(`${it} ${txt}`)
							await sock.readMessages([msg.key])
							await sendMessageWTyping({text: `${txt}`}, it)
                        }
						else if (body === '1' || group === '1'){
                            await sock.readMessages([msg.key])
							
                            await sendMessageWTyping({text: "hallo"}, msg.key.remoteJid)
                        }
						
						
					}
					
				}
				catch (e) {
					console.log(e);
					}
				}
			
			}
		}
	)

	return sock
}

startSock()
res.set("Content-Type", "text/html");
	//OR
	res.setHeader("Content-Type", "text/html");

	res.send(`
	<head>
        
        <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/sweetalert2@7.12.15/dist/sweetalert2.min.css'>
        <style>
            body {
            margin: 20px auto;
            font-family: 'Lato';
            font-weight: 300;
            width: 600px;
            text-align: center;
            }

            button {
            background: cornflowerblue;
            color: white;
            border: none;
            padding: 10px;
            border-radius: 8px;
            font-family: 'Lato';
            margin: 5px;
            text-transform: uppercase;
            cursor: pointer;
            outline: none;
            }

            button:hover {
            background: orange;
            }
        </style>
    </head>
	<body>
	<button style="font-family: Lucida Grande,Lucida Sans Unicode,Lucida Sans,Geneva,Verdana,sans-serif;font-weight:900;background-color:#ed5c75;color:#000;" class="btn btn-lg btn-block" type="button" disabled>
	  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
	  Loading qr...
	</button>
	<script src="https://cdn.jsdelivr.net/npm/sweetalert2@7.12.15/dist/sweetalert2.all.min.js"></script>
		<script src="https://code.jquery.com/jquery-3.6.0.js" integrity="sha256-H+K7U5CnXl1h5ywQfKtSj8PCmoN9aaq30gDh27Xc0jk=" crossorigin="anonymous"></script>
        <script>
					//setTimeout(function() {
					setTimeout(function swals(){
					$(".loader").hide();
                    swal({title: 'scan qr ini dalam waktu 1 menit',imageUrl: '/qrimg'}).then(function() {window.location = "/";});
                },5000);
				//}
        </script>
        <body onload="swals()"></body>
    </body>
	`);
});
app.get('/qrimg/', (req, res) => {
res.sendFile(__dirname + '/ano.png');
});

app.get('/', (req, res) => {
res.sendFile(__dirname + '/log.txt');
});
const port = process.env.PORT || 3111
app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})
