const { cmd } = require('../command');
 const config = require('../config'); // Make sure you have owner number in config
 
 cmd({
     pattern: "vv",
     alias: ["open", "save"],
     react: "🎐",
     desc: "Owner Only - Forwards quoted message back to user",
     category: "owner",
     filename: __filename
}, async (conn, mek, m, { from, quoted, reply, pushname }) => {
    try {
      if (!quoted) {
        return reply(`*🍁 ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴠɪᴇᴡ ᴏɴᴄᴇ ᴍᴇssᴀɢᴇ!*`);
      }
         const quotedMsg = await m.quoted.download();
         const msgType = m.quoted.mtype;
 
         // Enhanced forwarding with better error handling
         const forwardOptions = { quoted: mek };
         let sendOptions = {};
 
         switch(msgType) {
             case "imageMessage":
                 sendOptions = { 
                     image: quotedMsg, 
                     caption: m.quoted.text || '',
                     mimetype: m.quoted.mimetype || 'image/jpeg'
                 };
                 break;
                 
             case "videoMessage":
                 sendOptions = { 
                     video: quotedMsg,
                     caption: m.quoted.text || '',
                     mimetype: m.quoted.mimetype || 'video/mp4'
                 };
                 break;
                 
             case "audioMessage":
                 sendOptions = { 
                     audio: quotedMsg,
                     mimetype: 'audio/mp4',
                     ptt: m.quoted.ptt || false
                 };
                 break;
                 
             case "stickerMessage":
                 sendOptions = { sticker: quotedMsg };
                 break;
                 
             case "documentMessage":
                 sendOptions = { 
                     document: quotedMsg,
                     mimetype: m.quoted.mimetype || 'application/octet-stream',
                     fileName: m.quoted.fileName || 'document'
                 };
                 break;
                 
             case "textMessage":
             default:
                 if (m.quoted.text) {
                     sendOptions = { text: m.quoted.text };
                 } else {
                     return await conn.sendMessage(from, { 
                         text: "*📛 ᴀɴ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ ᴡʜɪʟᴇ ғᴇᴛᴄʜɪɴɢ ᴛʜᴇ ᴠɪᴇᴡᴏɴᴄᴇ ᴍᴇssᴀɢᴇ.*"
                     }, { quoted: mek });
                 }
         }
 
         await conn.sendMessage(from, sendOptions, forwardOptions);
 
     } catch (err) {
         console.error('Forward Error:', err);
         await conn.sendMessage(from, { 
             text: `❌ Error viewonce message:\n${err.message}`
         }, { quoted: mek });
     }
 });
