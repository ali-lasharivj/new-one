
const {cmd , commands} = require('../command');

//*Plugins name* superhero

// *Author* ROMEK XD 👑

cmd({
    pattern: "superhero",
    desc: "Simulates summoning a superhero with comic-book animations.",
    category: "fun",
    react: "🦸",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        const hero = args.length > 0 ? args.join(" ") : "ALI-MAN"; // User can specify a hero
        const steps = [
            '🦸 *ALI-MD HERO SUMMONING PROTOCOL...* 🦸',
            '',
            '*Charging superpower matrix...* ⚡',
            '*Locating hero signal...* 📍',
            '',
            '```[★☆☆☆☆☆☆☆☆☆] 10%``` 💥',
            '```[★★☆☆☆☆☆☆☆☆] 20%``` 💥',
            '```[★★★☆☆☆☆☆☆☆] 30%``` 💥',
            '```[★★★★☆☆☆☆☆☆] 40%``` 💥',
            '```[★★★★★☆☆☆☆☆] 50%``` 💥',
            '```[★★★★★★☆☆☆☆] 60%``` 💥',
            '```[★★★★★★★☆☆☆] 70%``` 💥',
            '```[★★★★★★★★☆☆] 80%``` 💥',
            '```[★★★★★★★★★☆] 90%``` 💥',
            '```[★★★★★★★★★★] 100%``` ✅',
            '',
            '*BOOM!* Hero signal locked! *KAPOW!* 🦸‍♂️',
            `🌟 *Summoning: ${hero}* 💪`,
            '*Activating hero powers...* 🔥',
            '',
            '*WHOOSH!* Hero soaring to the rescue! *ZOOM!* ✈️',
            '*Defeating villains...* 👊',
            '*Restoring peace...* 🕊️',
            '',
            '⚠️ *Warning:* Do not interrupt the hero!',
            '⚠️ *Note:* This is a fun superhero simulation.',
            '',
            ` *🦸 ${hero.toUpperCase()} SAVES THE DAY! 🌍*`,
            '',
            '> *© ᴘσωєʀє∂ ву αℓι м∂⎯꯭̽🐍*'
        ];

        // Initial "Hero Command Center" message
        const commandCenter = `
*🦸 ALI-MD HERO COMMAND CENTER 🦸*
‎*╭──────────────────✑*
*┋👤 Caller: ${pushname || 'Unknown'}*
*┋🦸 Hero: ${hero}*
*┋⚡ Power Level: ${Math.floor(Math.random() * 100 + 1)}%
*┋📡 Signal: Locked*
*┋🛡️ Mission: Save the Day*
‎*╰──────────────────✑*
*Calling all heroes!* 🚨
        `;
        await conn.sendMessage(from, { text: commandCenter }, { quoted: mek });

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
