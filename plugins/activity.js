const { cmd } = require("../command");
const { getActivityList } = require("../lib/activity");

cmd(
  {
    pattern: "tagactive",
    desc: "Mentions the most active members in the group 📊",
    category: "group",
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, isGroup }) => {
    try {
      if (!isGroup) return reply("🚫 *ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs!*");

      let activeList = getActivityList(from);
      if (activeList.length === 0) return reply("⚠️ *ɴᴏ ᴀᴄᴛɪᴠɪᴛʏ ʀᴇᴄᴏʀᴅᴇᴅ ʏᴇᴛ!*");

      let topActive = activeList.slice(0, 5); // Get top 5 active users
      let mentions = topActive.map((u) => `🔥 @${u.user.split("@")[0]} (${u.count} msgs)`).join("\n");

      let text = `📊 *ᴍᴏsᴛ ᴀᴄᴛɪᴠᴇ ᴍᴇᴍʙᴇʀs:*\n\n${mentions}\n\n🏆 *sᴛᴀʏ ᴇɴɢᴀɢᴇᴅ!*`;

      return await conn.sendMessage(from, { text, mentions: topActive.map((u) => u.user) }, { quoted: mek });
    } catch (e) {
      console.log(e);
      return reply(`❌ *Error:* ${e}`);
    }
  }
);

cmd(
  {
    pattern: "listgc",
    desc: "Lists all group members with their message count 📋",
    category: "group",
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, isGroup }) => {
    try {
      if (!isGroup) return reply("🚫 *ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs!*");

      let activityList = getActivityList(from);
      if (activityList.length === 0) return reply("⚠️ *ɴᴏ ᴍᴇssᴀɢᴇs ʜᴀᴠᴇ ʙᴇᴇɴ ʀᴇᴄᴏʀᴅᴇᴅ ʏᴇᴛ!*");

      let list = activityList.map((u, i) => `🔹 *${i + 1}.* @${u.user.split("@")[0]} - ${u.count} msgs`).join("\n");

      let text = `📋 *ɢʀᴏᴜᴘ ᴀᴄᴛɪᴠɪᴛʏ ʟɪsᴛ:*\n\n${list}\n\n💬 *ᴋᴇᴇᴘ ᴄʜᴀᴛᴛɪɴɢ!*`;

      return await conn.sendMessage(from, { text, mentions: activityList.map((u) => u.user) }, { quoted: mek });
    } catch (e) {
      console.log(e);
      return reply(`❌ *Error:* ${e}`);
    }
  }
);
