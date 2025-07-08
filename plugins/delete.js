const { cmd } = require("../command"); // Command management
const fs = require("fs"); // File system management
const path = require("path"); // Path management

cmd({
  pattern: "delete",
  react: "🧹",
  alias: ["del","dlt","d"],
  desc: "Delete message",
  category: "group",
  use: ".del",
  filename: __filename
},
async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, isItzcp, groupAdmins, isBotAdmins, isAdmins, reply }) => {

  // Check permission: Only allow execution if sender is the owner or an admin
  if (!isOwner && !isAdmins) return reply("*уσυ αʀє ɴσт тнє σωɴєʀ! 🚩*");

  try {
    // Check if a message is quoted and contains the necessary id
    if (!m.quoted || !m.quoted.id) return;

    // Use the key from the quoted message if available (works for both group and private chats)
    const key = m.quoted.key || {
      remoteJid: m.chat,
      fromMe: m.quoted.fromMe,
      id: m.quoted.id,
      participant: m.quoted.sender
    };

    // Delete the quoted message
    await conn.sendMessage(m.chat, { delete: key });

  } catch (e) {
    console.log(e);
    reply("Error while deleting the message.");
  }
});
