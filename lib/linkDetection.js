const { getLinkDetectionMode } = require("../linkDetection");
const { incrementWarning, resetWarning } = require("../warnings");

const setupLinkDetection = (sock) => {
    sock.ev.on("messages.upsert", async ({ messages }) => {
        for (const message of messages) {
            const groupJid = message.key.remoteJid;
            if (!groupJid.endsWith("@g.us") || message.key.fromMe) continue;

            const mode = getLinkDetectionMode(groupJid);
            if (!mode) return; // Antilink is off

            const msgText = message.message?.conversation || message.message?.extendedTextMessage?.text || "";

            // Link detection regex
            const linkRegex = /(?:https?:\/\/|www\.)[^\s]+|[a-zA-Z0-9]+\.[a-zA-Z]{2,}/gi;
            if (!linkRegex.test(msgText)) return; // No link found

            console.log(`🔗 ᴅᴇᴛᴇᴄᴛᴇᴅ ʟɪɴᴋ ɪɴ ɢʀᴏᴜᴘ ${groupJid}: ${msgText}`);

            const participant = message.key.participant || message.participant;

            // Fetch group metadata to check if the sender is an admin
            const groupMetadata = await sock.groupMetadata(groupJid);
            const isAdmins = groupMetadata.participants.some(
                (member) => member.id === participant && member.admin
            );

            if (isAdmins) {
                console.log(`✅ Ignoring admin: ${participant}`);
                return; // Don't delete messages or kick admins
            }

            // Delete message
            await sock.sendMessage(groupJid, { delete: message.key });

            if (mode === "warn") {
                const warningCount = incrementWarning(groupJid, participant);
                await sock.sendMessage(groupJid, {
                    text: `@${participant.split("@")[0]}, ʟɪɴᴋs ᴀʀᴇ ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ ʜᴇʀᴇ!\n⚠ ᴡᴀʀɴɪɴɢ: ${warningCount}/3`,
                    mentions: [participant],
                });

                if (warningCount >= 3) {
                    await sock.groupParticipantsUpdate(groupJid, [participant], "remove");
                    await sock.sendMessage(groupJid, {
                        text: `@${participant.split("@")[0]} ʜᴀs ʙᴇᴇɴ ʀᴇᴍᴏᴠᴇᴅ ғᴏʀ ʀᴇᴘᴇᴀᴛᴇᴅʟʏ sᴇɴᴅɪɴɢ ʟɪɴᴋs.`,
                        mentions: [participant],
                    });
                    resetWarning(groupJid, participant);
                }
            } else if (mode === "kick") {
                await sock.groupParticipantsUpdate(groupJid, [participant], "remove");
                await sock.sendMessage(groupJid, {
                    text: `@${participant.split("@")[0]} ʜᴀs ʙᴇᴇɴ ʀᴇᴍᴏᴠᴇᴅ ғᴏʀ sᴇɴᴅɪɴɢ ʟɪɴᴋs.`,
                    mentions: [participant],
                });
            }
        }
    });
};

module.exports = { setupLinkDetection };
