const { cmd } = require('../command');
const { getBuffer, fetchJson } = require('../lib/functions');

cmd({
    pattern: "p",
    react: "👤",
    alias: ["whois", "profile"],
    desc: "Get complete user profile information",
    category: "info",
    use: '.person [@tag or reply]',
    filename: __filename
},
async (conn, mek, m, { from, sender, isGroup, reply, quoted, participants }) => {
    try {
        // 1. DETERMINE TARGET USER
        let userJid = quoted?.sender || 
                     mek.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                     sender;

        // 2. VERIFY USER EXISTS
        const [user] = await conn.onWhatsApp(userJid).catch(() => []);
        if (!user?.exists) return reply("❌ User not found on WhatsApp");

        // 3. GET PROFILE PICTURE
        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(userJid, 'image');
        } catch {
            ppUrl = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';
        }

        // 4. GET NAME (MULTI-SOURCE FALLBACK)
        let userName = userJid.split('@')[0];
        try {
            // Try group participant info first
            if (isGroup) {
                const member = participants.find(p => p.id === userJid);
                if (member?.notify) userName = member.notify;
            }
            
            // Try contact DB
            if (userName === userJid.split('@')[0] && conn.contactDB) {
                const contact = await conn.contactDB.get(userJid).catch(() => null);
                if (contact?.name) userName = contact.name;
            }
            
            // Try presence as final fallback
            if (userName === userJid.split('@')[0]) {
                const presence = await conn.presenceSubscribe(userJid).catch(() => null);
                if (presence?.pushname) userName = presence.pushname;
            }
        } catch (e) {
            console.log("Name fetch error:", e);
        }

        // 5. GET BIO/ABOUT
        let bio = {};
        try {
            // Try personal status
            const statusData = await conn.fetchStatus(userJid).catch(() => null);
            if (statusData?.status) {
                bio = {
                    text: statusData.status,
                    type: "ᴘᴇʀsᴏɴᴀʟ",
                    updated: statusData.setAt ? new Date(statusData.setAt * 1000) : null
                };
            } else {
                // Try business profile
                const businessProfile = await conn.getBusinessProfile(userJid).catch(() => null);
                if (businessProfile?.description) {
                    bio = {
                        text: businessProfile.description,
                        type: "ʙᴜsɪɴᴇss",
                        updated: null
                    };
                }
            }
        } catch (e) {
            console.log("Bio fetch error:", e);
        }

        // 6. GET GROUP ROLE
        let groupRole = "";
        if (isGroup) {
            const participant = participants.find(p => p.id === userJid);
            groupRole = participant?.admin ? "*👑 ᴀᴅᴍɪɴ*" : "*👥 ᴍᴇᴍʙᴇʀ*";
        }

        // 7. FORMAT OUTPUT
        const formattedBio = bio.text ? 
            `${bio.text}\n*└─ 🫟 ${bio.type} ʙɪᴏ${bio.updated ? ` | ⏰* ${bio.updated.toLocaleString()}` : ''}` : 
            "*ɴᴏ ʙɪᴏ ᴀᴠᴀɪʟᴀʙʟᴇ*";

        const userInfo = `
‎*╭━━━★彡 PROFILE 彡★━━━╮*
‎
‎*🪼 ɴᴜᴍʙᴇʀ:* ${userJid.replace(/@.+/, '')}
‎*🎡 ᴀᴄᴄᴏᴜɴᴛ ᴛʏᴘᴇ:* ${user.isBusiness ? "*💼 ʙᴜsɪɴᴇss*" : user.isEnterprise ? "*🏢 ᴇɴᴛᴇʀᴘʀɪsᴇ*" : "*👤 ᴘᴇʀsᴏɴᴀʟ*"}
‎
‎*📑 ᴀʙᴏᴜᴛ:*
‎${formattedBio}
‎
‎*⚙️ ᴀᴄᴄᴏᴜɴᴛ ɪɴғᴏ:*
‎*✅ ʀᴇɢɪsᴛᴇʀᴇᴅ: ${user.isUser ? "ʏᴇs" : "ɴᴏ"}*
‎*🛡️ ᴠᴇʀɪғɪᴇᴅ:* ${user.verifiedName ? "*✔ ᴠᴇʀɪғɪᴇᴅ*" : "*✘ ɴᴏᴛ ᴠᴇʀɪғɪᴇᴅ*"}
‎${isGroup ? `🪀 *ɢʀᴏᴜᴘ ʀᴏʟᴇ:* ${groupRole}` : ''}
`.trim();

        // 8. SEND RESULT
        await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption: userInfo,
            mentions: [userJid]
        }, { quoted: mek });

    } catch (e) {
        console.error("Person command error:", e);
        reply(`❌ Error: ${e.message || "Failed to fetch profile"}`);
    }
});
                  
