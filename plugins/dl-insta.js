const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "igimagedl",
  alias: ["instagramimages", "igimages","igimage"],
  react: '📥',
  desc: "Download Instagram posts (images or videos).",
  category: "download",
  use: ".igdl <Instagram post URL>",
  filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
  try {
    // Check if the user provided an Instagram URL
    const igUrl = args[0];
    if (!igUrl || !igUrl.includes("instagram.com")) {
      return reply('*🏷️ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀɴ ɪɴsᴛᴀɢʀᴀᴍ ᴘᴏsᴛ ᴏʀ ʀᴇᴇʟ ʟɪɴᴋ.*');
    }

    // Add a reaction to indicate processing
    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    // Prepare the API URL
    const apiUrl = `https://api.fgmods.xyz/api/downloader/igdl?url=${encodeURIComponent(igUrl)}&apikey=E8sfLg9l`;

    // Call the API using GET
    const response = await axios.get(apiUrl);

    // Check if the API response is valid
    if (!response.data || !response.data.status || !response.data.result) {
      return reply('❌ Unable to fetch the post. Please check the URL and try again.');
    }

    // Extract the post details
    const { url, caption, username, like, comment, isVideo } = response.data.result;

    // Inform the user that the post is being downloaded
   // await reply(`📥 *Downloading Instagram post by @${username}... Please wait.*`);

    // Download and send each media item
    for (const mediaUrl of url) {
      const mediaResponse = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
      if (!mediaResponse.data) {
        return reply('❌ Failed to download the media. Please try again later.');
      }

      const mediaBuffer = Buffer.from(mediaResponse.data, 'binary');

      if (isVideo) {
        // Send as video
        await conn.sendMessage(from, {
          video: mediaBuffer,
          caption: `📥 *Instagram Post*\n\n` +
            `👤 *Username*: @${username}\n` +
            `❤️ *Likes*: ${like}\n` +
            `💬 *Comments*: ${comment}\n` +
            `📝 *Caption*: ${caption || "No caption"}\n\n` +
            `> *© ᴘσωєʀє∂ ву αℓι м∂⎯꯭̽🐍*`,
          contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isisForwarded: false,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363304315601080@newsletter',
              newsletterName: 'ALI-MD',
              serverMessageId: 143
            }
          }
        }, { quoted: mek });
      } else {
        // Send as image
        await conn.sendMessage(from, {
          image: mediaBuffer,
          caption: `📥 *Instagram Post*\n\n` +
            `👤 *Username*: @${username}\n` +
            `❤️ *Likes*: ${like}\n` +
            `💬 *Comments*: ${comment}\n` +
            `📝 *Caption*: ${caption || "No caption"}\n\n` +
            `> *© ᴘσωєʀє∂ ву αℓι м∂⎯꯭̽🐍*`,
          contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isisForwarded: false,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363304315601080@newsletter',
              newsletterName: 'ALI-MD',
              serverMessageId: 143
            }
          }
        }, { quoted: mek });
      }
    }

    // Add a reaction to indicate success
    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error('Error downloading Instagram post:', error);
    reply('❌ Unable to download the post. Please try again later.');

    // Add a reaction to indicate failure
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});
// VIDEO SECTION


cmd({
  pattern: "insta",
  alias: ["igvideo","ig","instagram", "igdl"],
  react: '📥',
  desc: "Download Instagram videos.",
  category: "download",
  use: ".igvid <Instagram video URL>",
  filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
  try {
    // Check if the user provided an Instagram video URL
    const igUrl = args[0];
    if (!igUrl || !igUrl.includes("instagram.com")) {
      return reply('*🏷️ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀɴ ɪɴsᴛᴀɢʀᴀᴍ ᴘᴏsᴛ ᴏʀ ʀᴇᴇʟ ʟɪɴᴋ.*');
    }

    // Add a reaction to indicate processing
    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    // Prepare the API URL
    const apiUrl = `https://api.nexoracle.com/downloader/aio2?apikey=free_key@maher_apis&url=${encodeURIComponent(igUrl)}`;

    // Call the API using GET
    const response = await axios.get(apiUrl);

    // Check if the API response is valid
    if (!response.data || response.data.status !== 200 || !response.data.result) {
      return reply('❌ Unable to fetch the video. Please check the URL and try again.');
    }

    // Extract the video details
    const { title, low, high } = response.data.result;

    // Inform the user that the video is being downloaded
    //await reply(`📥 *Downloading ${title || "Instagram video"}... Please wait.*`);

    // Choose the highest quality video URL
    const videoUrl = high || low;

    // Download the video
    const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer' });
    if (!videoResponse.data) {
      return reply('❌ Failed to download the video. Please try again later.');
    }

    // Prepare the video buffer
    const videoBuffer = Buffer.from(videoResponse.data, 'binary');

    // Send the video
    await conn.sendMessage(from, {
      video: videoBuffer,
      caption: `*🪸 ιиѕтα νι∂єσ ∂σωиℓσα∂є∂*\n` +
        `> *© ᴘσωєʀє∂ ву αℓι м∂⎯꯭̽🐍*`,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: false,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363300325631080@newsletter',
          newsletterName: 'ALI-MD',
          serverMessageId: 143
        }
      }
    }, { quoted: mek });

    // Add a reaction to indicate success
    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error('Error downloading Instagram video:', error);
    reply('❌ Unable to download the video. Please try again later.');

    // Add a reaction to indicate failure
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});
