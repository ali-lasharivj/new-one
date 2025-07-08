const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "getpp",
    alias: ["stealpp"],
    react: "🖼️",
    desc: "Sends the profile picture of a user by phone number (owner only)",
    category: "owner",
    use: ".getpp <phone number>",
    filename: __filename
},
async (conn, mek, m, { from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isCreator) return reply("*уσυ αʀє ɴσт тнє σωɴєʀ! 🚩*");

        if (!args[0]) return reply("Please provide a phone number.");

        let targetJid = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";

        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(targetJid, "image");
        } catch (e) {
            return reply("This user has no profile picture or it cannot be accessed.");
        }

        let userName = targetJid.split("@")[0];
        try {
            const contact = await conn.getContact(targetJid);
            userName = contact.notify || contact.vname || userName;
        } catch {
            // keep default number as fallback
        }

        await conn.sendMessage(from, { 
            image: { url: ppUrl }, 
            caption: `> *© ᴘσωєʀє∂ ву αℓι м∂⎯꯭̽🐍*`
        });

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (e) {
        reply("An error occurred while fetching the profile picture. Please try again later.");
        l(e);
    }
});
