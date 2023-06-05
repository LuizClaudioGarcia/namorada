const axios = require("axios");
const { PrismaClient } = require("@prisma/client")
const emojiRegex = require('emoji-regex');

const prisma = new PrismaClient({})

let lastMessage = {
    avaible: true,
    msg: {}
}

function countEmojis(string) {
    const regex = emojiRegex();
    const emojis = string.match(regex) || [];
    return emojis.length;
}


async function countMessage(message){
    if(message.type == "ptt" || message.type == "chat" || message.type == "image" || message.type == "video"){
     
        let msg = {
            content: message.type == "chat" ? message.body : "none",
            sentAt: message.timestamp,
            audioSeconds: message.type == "ptt" ? Number(message.duration) : 0,
            stickerCount: message.type == "chat" ? countEmojis(message.body) : 0,
            charactersCount: message.type == "chat" ? message.body.length : 0,
            sentBy: message.from,
            type: message.type
        }

        if(lastMessage.avaible) {
            lastMessage.msg = msg
            lastMessage.avaible = false
        }else{
            if(lastMessage.msg.sentBy != message.from){
                const user = await prisma.user.findUnique({
                    where: { id: message.from },
                });

                if(user){
                    console.log("TIME MEU: " + Math.floor(Date.now() / 1000) + " TIME DELE: " + lastMessage.msg.sentAt)
                    let tempoRespondido =  Math.floor(Date.now() / 1000) - lastMessage.msg.sentAt

                    await prisma.user.update({
                        where: { id: message.from },
                        data: {
                          respondeu: user.respondeu + 1,
                          tempoTotal: user.tempoTotal + tempoRespondido,
                        },
                    });

                    console.log(message.from + " RESPONDEU EM: " + tempoRespondido)
                    lastMessage.msg = msg
                }
            }
        }

        console.log(msg)
        console.log(message.from)

        await prisma.message.create({
            data: {
              content: msg.content,
              audioSeconds: msg.audioSeconds,
              stickerCount: msg.stickerCount,
              charactersCount: msg.charactersCount,
              sentBy: { connect: { id: message.from } },
              type: msg.type
            },
        });

       
    }
}

// Evento que reage ao receber uma mensagem
async function start(client) {
    client.onAnyMessage( async (message) => {
        if(  (message.from == "5527998607616@c.us" && message.to  == "5527988159926@c.us") || (message.from == "5527988159926@c.us" && message.to == "5527998607616@c.us"))  {
            if( message.isGroupMsg ){ return }
            countMessage(message )
        }else if(message.from == "5527998607616@c.us" && message.type == "chat"){
            if(message.body == "!namorada" ){
                await client.sendText(message.to, "Funfando")
            }
        }
    });
}

module.exports = {
    start: start
};
