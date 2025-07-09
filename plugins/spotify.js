const { cmd } = require('../command');
 const axios = require('axios');
 
 cmd({
     pattern: "sptdl",
     alias: ["spotifydl", "spotidown"],
     desc: "Download Spotify music as MP3",
     category: "download",
     react: "🎵",
     filename: __filename
 },
 async (conn, mek, m, { from, args, q, reply, pushname }) => {
     try {
         if (!q) return reply("*Please provide a Spotify link.*");
         if (!q.includes("spotify.com")) return reply("*Invalid Spotify link provided.*");
 
         reply("⏳ *Fetching Spotify track... Please wait!*");
 
         const { data } = await axios.get(`https://api.giftedtech.web.id/api/download/spotifydl`, {
             params: {
                 apikey: "gifted", // <-- Yahan apna actual API key dalna ho to update kar lena
                 url: q
             }
         });
 
         if (!data.success || !data.result) return reply("*Failed to fetch Spotify track. Please try again later.*");
 
         const {
             title,
             duration,
             quality,
             thumbnail,
             download_url
         } = data.result;
 
         const caption = `
 *⫷⦁ SPOTIFY DOWNLOADER ⦁⫸*
 
 🎵 *Title:* ${title}
 ⏱️ *Duration:* ${duration}
 🔊 *Quality:* ${quality}
 
 > *DOWNLOADED BY ALI-MD*
 `.trim();
 
         // Send thumbnail with info
         await conn.sendMessage(from, {
             image: { url: thumbnail },
             caption: caption
         }, { quoted: mek });
 
         // Send the actual MP3 file
         await conn.sendMessage(from, {
             audio: { url: download_url },
             mimetype: "audio/mpeg",
             ptt: false
         }, { quoted: mek });
 
     } catch (e) {
         console.error("Spotify Download Error:", e);
         reply("*Oops! An error occurred while downloading the Spotify track.*");
     }
 });
   
