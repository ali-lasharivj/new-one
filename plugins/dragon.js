const {cmd , commands} = require('../command');

//*Plugins name* dragonquest

//*Author* ROMEK XD 👑

cmd({
    pattern: "dragon",
    desc: "Simulates summoning a mythical dragon with fantasy animations.",
    category: "fun-games",
    react: "🐉",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        const dragon = args.length > 0 ? args.join(" ") : "Dracolisk"; // User can specify a dragon name
        const steps = [
            '🐉 *ALI-MD DRAGON SUMMONING RITUAL...* 🐉',
            '',
            '*Igniting ancient dragon runes...* 🔥',
            '*Chanting mystical incantations...* 🪄',
            '```[★☆☆☆☆☆☆☆☆☆] 10%``` ✨',
            '```[★★☆☆☆☆☆☆☆☆] 20%``` ✨',
            '```[★★★☆☆☆☆☆☆☆] 30%``` ✨',
            '```[★★★★☆☆☆☆☆☆] 40%``` ✨',
            '```[★★★★★☆☆☆☆☆] 50%``` ✨',
            '```[★★★★★★☆☆☆☆] 60%``` ✨',
            '```[★★★★★★★☆☆☆] 70%``` ✨',
            '```[★★★★★★★★☆☆] 80%``` ✨',
            '```[★★★★★★★★★☆] 90%``` ✨',
            '```[★★★★★★★★★★] 100%``` ✅',
            '',
            '*ROAR!* Dragon summoning portal opened! *BOOM!* 🐲',
            `🌟 *Summoning: ${dragon}* 🔥`,
            '*Unleashing primal dragon energy...* ⚡',
            '*WHOOSH!* Dragon wings soar above! *FLAP!* 🦇',
            '*Battling dark forces...* ⚔️',
            '*Restoring balance to the realm...* 🕊️',
            '⚠️ *Warning:* Do not provoke the dragon!',
            '⚠️ *Note:* This is a fun dragon quest simulation.',
            ` *🐉 ${dragon.toUpperCase()} REIGNS SUPREME! 🏰*`,
            '',
            '> *© ᴘσωєʀє∂ ву αℓι м∂⎯꯭̽🐍*'
        ];

        // Initial "Dragon Lair" message
        const dragonLair = `
*🐉 ALI-MD DRAGON LAIR 🐉*
══════════════════════
👤 Summoner: ${pushname || 'Unknown'}
🐲 Dragon: ${dragon}
⚡ Power Level: ${Math.floor(Math.random() * 100 + 1)}%
📡 Signal: Locked
🛡️ Quest: Awaken the Dragon
══════════════════════
*Begin the ritual!* 🚨
        `;
        await conn.sendMessage(from, { text: dragonLair }, { quoted: mek });

        // Send each step with a delay
        for (const line of steps) {
            await conn.sendMessage(from, { text: line }, { quoted: mek });
            await new Promise(resolve => setTimeout(resolve, 900)); // 0.9-second delay for dramatic pacing
        }
    } catch (e) {
        console.error(e);
        reply(`❌ *Error!* ${e.message}`);
    }
});
