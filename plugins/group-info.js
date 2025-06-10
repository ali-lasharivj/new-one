const config = require('../config')
const { cmd } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep } = require('../lib/functions')

   cmd({
  pattern: "getinfo ?(.*)",
  category: "group",
  desc: "Get group info by invite link or current group",
  filename: __filename
}, async (conn, m, msg, { isGroup, match, reply }) => {
  try {
    let code = match?.trim();

    // If used in a group and no code is given, show current group info
    if (!code && isGroup) {
      const metadata = await conn.groupMetadata(m.chat);
      const inviteCode = await conn.groupInviteCode(m.chat);
      const groupOwner = metadata.owner || "Not available";
      const groupDesc = metadata.desc || "No description";

      return reply(
        `📛 Name: ${metadata.subject}\n` +
        `📝 Description: ${groupDesc}\n` +
        `👑 Owner: ${groupOwner}\n` +
        `👥 Participants: ${metadata.participants.length}\n` +
        `🆔 Group ID: ${m.chat}\n` +
        `🔗 Invite Link: https://chat.whatsapp.com/${inviteCode}`
      );
    }

    // Extract invite code from full URL if needed
    if (code.includes("chat.whatsapp.com/")) {
      code = code.split("chat.whatsapp.com/")[1].trim();
    }

    if (!code) return reply("❌ Please provide a valid invite link or code.");

    const info = await conn.groupGetInviteInfo(code);

    return reply(
      `📛 Name: ${info.subject}\n` +
      `📝 Description: ${info.desc || "No description"}\n` +
      `👑 Owner: ${info.owner || "Not available"}\n` +
      `👥 Participants: ${info.size}\n` +
      `🆔 Group ID: ${info.id}\n` +
      `🔗 Invite Link: https://chat.whatsapp.com/${code}`
    );
  } catch (e) {
    console.error(e);
    reply("❌ Failed to fetch group info. Make sure the invite code is valid and not expired.");
  }
});

cmd({
  pattern: "getgcpp",
  category: "group",
  desc: "Send the profile picture of the group",
  filename: __filename
}, async (conn, m, msg, { isGroup, reply }) => {
  try {
    if (!isGroup) return reply("❌ this command only working in group.");

    const groupJid = m.chat;

    let ppUrl;
    try {
      // Try to fetch high resolution photo first
      ppUrl = await conn.profilePictureUrl(groupJid, "image");
    } catch (e) {
      // Fallback to low res if high res fails
      try {
        ppUrl = await conn.profilePictureUrl(groupJid);
      } catch (err) {
        return reply("❌ can't find group picture or not set.");
      }
    }

    await conn.sendMessage(m.chat, { image: { url: ppUrl }, caption: "🖼️ Profile picture of group" }, { quoted: m });

  } catch (err) {
    console.error("getgcpp Error:", err);
    reply(`❌ error :\n${err.message}`);
  }
});

cmd({
  pattern: "getallgc",
  category: "group",
  desc: "Get all group invite links with their names and participant count",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  try {
    let allGroups = await conn.groupFetchAllParticipating();
    let groupIds = Object.keys(allGroups);

    if (groupIds.length === 0) {
      return reply("❌ No groups found.");
    }

    let resultText = `📋 *List of Groups and Invite Links*\n\n`;

    for (let groupId of groupIds) {
      try {
        let metadata = allGroups[groupId];
        let name = metadata.subject || "Unnamed";
        let participantsCount = metadata.participants.length;

        // Try to get group invite code
        let inviteCode = await conn.groupInviteCode(groupId);
        let inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

        resultText += `📌 *${name}*\n👥 Members: ${participantsCount}\n🔗 Link: ${inviteLink}\n\n`;
      } catch (err) {
        console.log(`⚠️ Failed to fetch invite for group ${groupId}:`, err);
        resultText += `📌 *${allGroups[groupId].subject || "Unnamed"}*\n❌ Failed to fetch link\n\n`;
      }
    }

    reply(resultText);
  } catch (err) {
    console.error("getallgc Error:", err);
    reply(`❌ Error occurred:\n${err.message}`);
  }
});     
