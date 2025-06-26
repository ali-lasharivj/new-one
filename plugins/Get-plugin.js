const { cmd, commands } = require('../command');
const fs = require('fs');
const path = require('path');

cmd({
    pattern: "get",
    alias: ["plugin", "js"],
    desc: "Fetch the full source code of a command",
    category: "owner",
    react: "📜",
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    try {
        // Strict JID restriction
        const allowedJid = "923003588997@s.whatsapp.net";
        if (sender !== allowedJid) {
            return reply("*🫟σɴℓу тнє σωɴєʀ ¢αɴ ᴜѕє тнιѕ ¢σммαɴ∂!*");
        }

        if (!args[0]) return reply("❌ Please provide a command name. Example: `.get alive`");

        const commandName = args[0].toLowerCase();
        const commandData = commands.find(cmd => cmd.pattern === commandName || (cmd.alias && cmd.alias.includes(commandName)));

        if (!commandData) return reply("❌ Command not found!");

        // Get the command file path
        const commandPath = commandData.filename;

        // Read the full source code
        const fullCode = fs.readFileSync(commandPath, 'utf-8');

        // Truncate long messages for WhatsApp
        let truncatedCode = fullCode;
        if (truncatedCode.length > 4000) {
            truncatedCode = fullCode.substring(0, 4000) + "\n\n// Code too long, sending full file 📂";
        }

        // Formatted caption with truncated code
        const formattedCode = `*╭┈─「 ρℓυgιɴѕ ѕσυʀ¢є 」┈─❍*        
${truncatedCode}
\`\`\`
*╰──────────────────⊷*
> *© ᴘσωєʀє∂ ву αℓι м∂⎯꯭̽🐍*`;

        // Send image with truncated source code
        await conn.sendMessage(from, { 
            image: { url: `https://files.catbox.moe/6ku0eo.jpg` },
            caption: formattedCode,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363318387454868@newsletter',
                    newsletterName: '𝐀ɭīī 𝐌Ɗ 𝐒ʊ̊𝐏𝐏๏፝֟ɼʈ⎯꯭̽💀🚩 ',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

        // Send full source file
        const fileName = `${commandName}.js`;
        const tempPath = path.join(__dirname, fileName);
        fs.writeFileSync(tempPath, fullCode);

        await conn.sendMessage(from, { 
            document: fs.readFileSync(tempPath),
            mimetype: 'text/javascript',
            fileName: fileName
        }, { quoted: mek });

        // Delete the temporary file
        fs.unlinkSync(tempPath);

    } catch (e) {
        console.error("Error in .get command:", e);
        reply(`❌ Error: ${e.message}`);
    }
});
