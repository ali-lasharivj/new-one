const { cmd } = require('../command');

cmd({
    pattern: "out",
    alias: ["ck", "🦶"],
    desc: "Removes all members with specific country code from the group",
    category: "owner",
    react: "💀",
    filename: __filename
},
async (conn, mek, m, {
    from, q, isGroup, isBotAdmins, reply, groupMetadata, isCreator
}) => {
    if (!isGroup) return reply("❌ This command can only be used in groups.");

    // Permission check using isCreator
    if (!isCreator) {
        return await conn.sendMessage(from, {
            text: "*уσυ αʀє ɴσт тнє σωɴєʀ! 🚩*"
        }, { quoted: mek });
    }

    if (!isBotAdmins) return reply("❌ I need to be an admin to use this command.");
    if (!q) return reply("*❌ Please provide a country code. Example: .out 972*");

    const countryCode = q.trim();
    if (!/^\d+$/.test(countryCode)) {
        return reply("❌ Invalid country code. Please provide only numbers (e.g., 92 for +92 numbers)");
    }

    try {
        const participants = await groupMetadata.participants;
        const targets = participants.filter(
            participant => participant.id.startsWith(countryCode) && !participant.admin
        );

        if (targets.length === 0) {
            return reply(`❌ No members found with country code +${countryCode}`);
        }

        const jids = targets.map(p => p.id);
        await conn.groupParticipantsUpdate(from, jids, "remove");

        reply(`*✅ ѕᴜᴄᴄєѕѕfᴜℓℓу ʀємσνє∂: ${targets.length}*`);
    } catch (error) {
        console.error("Out command error:", error);
        reply("❌ Failed to remove members. Error: " + error.message);
    }
});
