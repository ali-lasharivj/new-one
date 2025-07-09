


const {cmd , commands} = require('../command');

//*Plugins name* timetravel

// *Author* ROMEK XD 👑

cmd({
    pattern: "timetravel",
    desc: "Simulates a playful 'Time Travel' sequence with sci-fi animations.",
    category: "fun-games",
    react: "⏳",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        const destination = args.length > 0 ? args.join(" ") : "Year 3000"; // User can specify a time/place
        const steps = [
            '🚀 *ALI-MD TIME MACHINE BOOTING...* 🚀',
            '*Calibrating quantum flux capacitor...* ⚡️',
            '*Syncing with temporal coordinates...* 🕰️',
            '```[██████████] 10%``` 🌌',
            '```[████████████████████] 20%``` 🌌',
            '```[██████████████████████████████] 30%``` 🌌',
            '```[████████████████████████████████████████] 40%``` 🌌',
            '```[██████████████████████████████████████████████████] 50%``` 🌌',
            '```[████████████████████████████████████████████████████████████] 60%``` 🌌',
            '```[██████████████████████████████████████████████████████████████████████] 70%``` 🌌',
            '```[████████████████████████████████████████████████████████████████████████████████] 80%``` 🌌',
            '```[██████████████████████████████████████████████████████████████████████████████████████████] 90%``` 🌌',
            '```[████████████████████████████████████████████████████████████████████████████████████████████████████] 100%``` ✅',
            '*BZZT!* Temporal rift detected! *BZZT!* ⚠️',
            `🌍 *Destination locked: ${destination}* 🛸`,
            '*Activating chrono-shield...* 🛡️',
            '*WHOOSH!* Engaging warp drive... *ZOOM!* 💫',
            '*Stabilizing time vortex...* 🌀',
            '*Arriving at destination...* 🏁',
            '⚠️ *Warning:* Do not alter the timeline!',
            '⚠️ *Note:* Time travel is for entertainment only.',
            ` *🕰️ TIME TRAVEL TO ${destination.toUpperCase()} SUCCESSFUL! 🪐*`,
            '> *© ᴘσωєʀє∂ ву αℓι м∂⎯꯭̽🐍*'
        ];

        // Initial "Time Machine Control Panel" message
        const controlPanel = `*🌌 ALI-MD TIME MACHINE V3.0 🌌*
‎*╭──────────────────✑*
*┋👤 Traveler: ${pushname || 'Unknown'}*
*┋📅 Destination: ${destination}*
*┋🔋 Power: ${Math.floor(Math.random() * 100 + 1)}% Charged*
*┋🌠 Warp Speed: 88 Teraflops*
*┋🛠 Status: Ready for Jump*
‎*╰──────────────────✑*
*Initiate Time Jump?* Y/N 😎`;
        await conn.sendMessage(from, { text: controlPanel }, { quoted: mek });

        // Send each step with a delay
        for (const line of steps) {
            await conn.sendMessage(from, { text: line }, { quoted: mek });
            await new Promise(resolve => setTimeout(resolve, 800)); // 0.8-second delay for faster pacing
        }
    } catch (e) {
        console.error(e);
        reply(`❌ *Error!* ${e.message}`);
    }
});
