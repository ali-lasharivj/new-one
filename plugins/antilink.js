const { cmd } = require("../command");
const { enableLinkDetection, disableLinkDetection, getLinkDetectionMode } = require("../lib/linkDetection");

cmd({
    pattern: "antilinkop",
    desc: "Manage anti-link settings in a group.",
    category: "moderation",
    filename: __filename
}, async (conn, mek, m, { from, args, isGroup, isAdmins, reply }) => {
    if (!isGroup) return reply("*ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs!*");
    if (!isAdmins) return reply("*ʏᴏᴜ ᴍᴜsᴛ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const mode = args[0]?.toLowerCase();
    if (!mode || !["kick", "delete", "warn", "off"].includes(mode)) {
        return reply("*ᴜsᴀɢᴇ: ᴀɴᴛɪʟɪɴᴋᴏᴘ [ᴋɪᴄᴋ/ᴅᴇʟᴇᴛᴇ/ᴡᴀʀɴ/ᴏғғ]*");
    }

    if (mode === "off") {
        disableLinkDetection(from);
        return reply("*Antilink has been disabled for this group.*");
    }

    enableLinkDetection(from, mode);
    return reply(`*Antilink is now set to '${mode}' mode in this group.*`);
});
