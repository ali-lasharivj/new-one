
const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

const fetch = require('node-fetch');
const config = require('../config');    
const { cmd } = require('../command');

cmd({
    pattern: "script",
    alias: ["repo", "sc", "info"],
    desc: "Fetch information about a GitHub repository.",
    react: "🎗️",
    category: "info",
    filename: __filename,
},
async (conn, mek, m, { from, reply }) => {
    const githubRepoURL = 'https://github.com/itx-alii-raza/ALI-MD';

    try {
        // Extract username and repo name from the URL
        const [, username, repoName] = githubRepoURL.match(/github\.com\/([^/]+)\/([^/]+)/);

        // Fetch repository details using GitHub API
        const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`);
        
        if (!response.ok) {
            throw new Error(`GitHub API request failed with status ${response.status}`);
        }

        const repoData = await response.json();

        // Format the repository information
        const formattedInfo = `*𝐇𝐄𝐋𝐋𝐎 𝐓𝐇𝐄𝐑𝐄 𝐀𝐋𝐈-𝐌𝐃 𝐖.𝐀 𝐁𝐎𝐓 𝐔𝐒𝐄𝐑!😇👑* 

> *sɪᴍᴘʟᴇ, ɪᴄʏ, ᴄᴏʟᴅ  & ʀɪᴄʜ ʟᴏᴀᴅᴇᴅ ʙᴏᴛ ᴡɪᴛʜ ᴀᴍᴀᴢɪɴɢ ғᴇᴀᴛᴜʀᴇs, ᴅᴏɴ'ᴛ ғᴏʀɢᴇᴛ ᴛᴏ sᴛᴀʀ & ғᴏʀᴋ ᴛʜᴇ ʀᴇᴘᴏ🌟🍴*

*\`REPO LINK:\`📮*
> https://github.com/itx-alii-raza/ALI-MD/fork

*\`BOT SUPPORT GC:\`🪀*
> https://tinyurl.com/2acmqaqz

*\`BOT NAME:\`🤖*
> ${repoData.name}

*\`OWNER NAME:\`👨‍💻*
> 𝐀ɭīī 𝐈ƞ̄x̷īīɖ𝛆̽

*\`STARS:\`🌟*
> ${repoData.stargazers_count}

*\`FORKS:\`🍴*
> ${repoData.forks_count}

*\`DESCRIPTION:\`📑*
> ${repoData.description || 'No description'}\n
\n> *© ᴘσωєʀє∂ ву αℓι м∂⎯꯭̽🐍*`;

        // Send an image with the formatted info as a caption and context info
        await conn.sendMessage(from, { 
    image: { url: config.ALIVE_IMG || 'https://files.catbox.moe/6ku0eo.jpg' }, 
    caption: formattedInfo, 
    contextInfo: { 
        mentionedJid: [m.sender], 
        forwardingScore: 999, 
        isForwarded: true, 
        forwardedNewsletterMessageInfo: { 
            newsletterJid: '120363318387454868@newsletter', 
            newsletterName: '𓆩ྀི͛𝐀𝐋𝐈 𝐌𝐃 𝐑𝐄𝐏𝐎ྀི𓆪͛',
            serverMessageId: 143 
        } 
    } 
}, { quoted: mek });

} catch (e) { 
    console.log(e); 
    reply(`Error: ${e}`); 
} 
});
