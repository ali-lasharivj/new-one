const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "nglimg",
    alias: ["nglimage", "ngl", "getngl"],
    desc: "Generate an NGL-style image using custom text",
    category: "media",
    react: "🎨",
    filename: __filename
}, async (conn, mek, m, { from, reply, text }) => {
    try {
        if (!text) return reply('❌ Please provide some text to generate NGL image.\nExample: !nglimg Aslam o Alykum');

        const encodedText = encodeURIComponent(text.trim());
        const apiUrl = `https://jawad-tech.vercel.app/random/ngl?text=${encodedText}`;

        // Check if the API returns a valid image
        try {
            const headCheck = await axios.head(apiUrl);
            if (!headCheck.headers['content-type']?.startsWith('image/')) {
                return reply('❌ Failed to generate image. API did not return an image.');
            }
        } catch (e) {
            return reply('❌ Could not reach the NGL API. Please try again later.');
        }

        // Send the image
        await conn.sendMessage(from, {
            image: { url: apiUrl },
            caption: `> *© ᴘσωєʀє∂ ву αℓι м∂⎯꯭̽🐍*`
        }, { quoted: mek });

    } catch (err) {
        console.error('NGL Image Error:', err);
        reply('❌ Something went wrong while generating image.\nError: ' + err.message);
    }
});
