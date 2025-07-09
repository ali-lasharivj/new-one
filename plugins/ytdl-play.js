const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search');

cmd({
    pattern: "song2",
    alias: ["play2", "music02"],
    react: "🎵",
    desc: "Download audio from YouTube",
    category: "download",
    use: ".song <query or url>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("Please provide a song name!");

        await reply("⏳ Downloading audio...");

        // Use API to get audio
        const apiUrl = `https://apis.davidcyriltech.my.id/play?query=${encodeURIComponent(q)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        await conn.sendMessage(from, {
            audio: { url: data.result.download_url },
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: mek });

        await reply(`✅ *${q}* downloaded successfully!`);

    } catch (error) {
        console.error(error);
        await reply(`❌ Error: ${error.message}`);
    }
});

