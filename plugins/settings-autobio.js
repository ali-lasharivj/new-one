const { cmd } = require('../command');
const config = require('../config');

let bioInterval;
const defaultBio = "αℓι-м∂ | σиℓιиє 💀🚩";
const timeZone = 'Asia/Karachi';

cmd({
    pattern: "autobio",
    alias: ["autoabout"],
    desc: "Toggle automatic bio updates",
    category: "misc",
    filename: __filename,
    usage: `${config.PREFIX}autobio [on/off]`
}, async (conn, mek, m, { args, reply, isOwner }) => {
    if (!isOwner) return reply("*σɴℓу σωɴєʀ ᴄαɴ υѕє тнιѕ ᴄσммαɴ∂! 🚩*");

    const [action, ...bioParts] = args;
    const customBio = bioParts.join(' ');

    try {
        if (action === 'on') {
            if (config.AUTO_BIO === "true") {
                return reply("*⚙️ αυтσ-вισ ιѕ αℓяєα∂у єиαвℓє∂*");
            }

            // Update config
            config.AUTO_BIO = "true";
            if (customBio) {
                // Store custom bio in memory only (not in env)
                config.AUTO_BIO_TEXT = customBio;
            } else {
                config.AUTO_BIO_TEXT = defaultBio;
            }

            // Start updating bio you
            startAutoBio(conn, config.AUTO_BIO_TEXT);
            return reply(`*✅ αυтσ-вισ єиαвℓє∂*\n*¢υяяєит тєχт:* "${config.AUTO_BIO_TEXT}"`);

        } else if (action === 'off') {
            if (config.AUTO_BIO !== "true") {
                return reply("*🔒 αυтσ-вισ ιѕ αℓяєα∂у ∂ιѕαвℓє∂*");
            }
            
            // Update config
            config.AUTO_BIO = "false";
            
            // Stop updating bio
            stopAutoBio();
            return reply("*❌ αυтσ-вισ ∂ιѕαвℓє∂*");

        } else {
            return reply(`Usage:\n` +
                `${config.PREFIX}autobio on [text] - Enable with optional custom text\n` +
                `${config.PREFIX}autobio off - Disable auto-bio\n\n` +
                `Available placeholders:\n` +
                `{time} - Current time\n` +
                `Current status: ${config.AUTO_BIO === "true" ? 'ON' : 'OFF'}\n` +
                `Current text: "${config.AUTO_BIO_TEXT || defaultBio}"`);
        }
    } catch (error) {
        console.error('Auto-bio error:', error);
        return reply("❌ Failed to update auto-bio settings");
    }
});

// Start auto-bio updates
function startAutoBio(conn, bioText) {
    stopAutoBio(); // Clear any existing interval
    
    bioInterval = setInterval(async () => {
        try {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { timeZone });
            const formattedBio = bioText.replace('αℓι-м∂ | σиℓιиє 💀🚩');
            await conn.updateProfileStatus(formattedBio);
        } catch (error) {
            console.error('Bio update error:', error);
            stopAutoBio();
        }
    }, 10 * 1000);
}

// Stop auto-bio updates
function stopAutoBio() {
    if (bioInterval) {
        clearInterval(bioInterval);
        bioInterval = null;
    }
}

// Initialize auto-bio if enabled in config
module.exports.init = (conn) => {
    if (config.AUTO_BIO === "true") {
        const bioText = config.AUTO_BIO_TEXT || defaultBio;
        startAutoBio(conn, bioText);
    }
};
                                  
