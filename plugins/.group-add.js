const config = require("../config");
const { cmd, commands } = require("../command");
const { downloadContentFromMessage } = require("baileys");

// Helper function to convert a stream to a Buffer.
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// A small delay function to avoid rate limits.
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Command: add - Adds a person to the group.
cmd(
  {
    pattern: "add",
    desc: "Adds a person to group",
    category: "group",
    filename: __filename,
  },
  async (conn, mek, m, { from, quoted, args, reply, isGroup, isBotAdmins }) => {
    try {
      if (!isGroup) return reply("_This command is for groups_");
      if (!isBotAdmins) return reply("_I'm not admin_");
      if (!args[0] && !quoted) return reply("_Mention user to add_");

      let jid = quoted ? quoted.sender : args[0] + "@s.whatsapp.net";
      await conn.groupParticipantsUpdate(from, [jid], "add");
      return reply(`@${jid.split("@")[0]} added`, { mentions: [jid] });
    } catch (e) {
      console.log(e);
      m.reply(`${e}`);
    }
  }
);

// Command: kick - Kicks a person from the group.
cmd(
  {
    pattern: "kick",
    desc: "Kicks a person from group",
    category: "group",
    filename: __filename,
  },
  async (
    conn,
    mek,
    m,
    { from, quoted, args, reply, isGroup, isBotAdmins, groupMetadata }
  ) => {
    try {
      if (!isGroup) return reply("_This command is for groups_");
      if (!isBotAdmins) return reply("_I'm not admin_");

      let jids = [];
      if (m.mentionedJid && m.mentionedJid.length) {
        jids = m.mentionedJid;
      } else if (quoted) {
        jids = [quoted.sender];
      } else if (args[0]) {
        jids = [args[0] + "@s.whatsapp.net"];
      } else {
        return reply("_Mention user to kick_");
      }

      let kickedNames = [];
      for (const jid of jids) {
        await conn.groupParticipantsUpdate(from, [jid], "remove");
        // Small delay between updates
        await delay(500);
        let participant =
          groupMetadata?.participants?.find((p) => p.id === jid);
        let displayName =
          (participant && participant.name) || jid.split("@")[0];
        kickedNames.push(displayName);
      }
      return reply(`${kickedNames.map((name) => `@${name}`).join(", ")} kicked`, {
        mentions: jids,
      });
    } catch (e) {
      console.log(e);
      m.reply(`${e}`);
    }
  }
);

// Command: promote - Promotes a member to admin.
cmd(
  {
    pattern: "promote",
    desc: "Promotes a member",
    category: "group",
    filename: __filename,
  },
  async (
    conn,
    mek,
    m,
    { from, quoted, args, reply, isGroup, isBotAdmins, groupMetadata }
  ) => {
    try {
      if (!isGroup) return reply("_This command is for groups_");
      if (!isBotAdmins) return reply("_I'm not admin_");

      let jids = [];
      if (m.mentionedJid && m.mentionedJid.length) {
        jids = m.mentionedJid;
      } else if (quoted) {
        jids = [quoted.sender];
      } else if (args[0]) {
        jids = [args[0] + "@s.whatsapp.net"];
      } else {
        return reply("_Mention user to promote_");
      }

      let promotedNames = [];
      for (const jid of jids) {
        await conn.groupParticipantsUpdate(from, [jid], "promote");
        await delay(500);
        let participant =
          groupMetadata?.participants?.find((p) => p.id === jid);
        let displayName =
          (participant && participant.name) || jid.split("@")[0];
        promotedNames.push(displayName);
      }
      return reply(
        `${promotedNames.map((name) => `@${name}`).join(", ")} promoted as admin`,
        { mentions: jids }
      );
    } catch (e) {
      console.log(e);
      m.reply(`${e}`);
    }
  }
);

// Command: demote - Demotes an admin.
cmd(
  {
    pattern: "demote",
    desc: "Demotes a member",
    category: "group",
    filename: __filename,
  },
  async (
    conn,
    mek,
    m,
    { from, quoted, args, reply, isGroup, isBotAdmins, groupMetadata }
  ) => {
    try {
      if (!isGroup) return reply("_This command is for groups_");
      if (!isBotAdmins) return reply("_I'm not admin_");

      let jids = [];
      if (m.mentionedJid && m.mentionedJid.length) {
        jids = m.mentionedJid;
      } else if (quoted) {
        jids = [quoted.sender];
      } else if (args[0]) {
        jids = [args[0] + "@s.whatsapp.net"];
      } else {
        return reply("_Mention user to demote_");
      }

      let demotedNames = [];
      for (const jid of jids) {
        await conn.groupParticipantsUpdate(from, [jid], "demote");
        await delay(500);
        let participant =
          groupMetadata?.participants?.find((p) => p.id === jid);
        let displayName =
          (participant && participant.name) || jid.split("@")[0];
        demotedNames.push(displayName);
      }
      return reply(
        `${demotedNames.map((name) => `@${name}`).join(", ")} demoted from admin`,
        { mentions: jids }
      );
    } catch (e) {
      console.log(e);
      m.reply(`${e}`);
    }
  }
);


// Command: everyone - Tags everyone with a custom message, replying to the quoted message.
cmd(
  {
    pattern: "everyone",
    desc: "Tags everyone to a message (sent as a reply to the quoted message) without listing individual members",
    category: "group",
    filename: __filename,
  },
  async (conn, mek, m, { from, args, reply, isGroup, groupMetadata }) => {
    try {
      if (!isGroup) return reply("_This command is for groups_");
      if (!m.quoted) return reply("_Please reply to a message to tag everyone_");

      let messageText = args.join(" ").trim();
      if (!messageText) {
        return reply("_Please provide a message_");
      }
      const mentions = groupMetadata.participants.map((p) => p.id);
      await conn.sendMessage(from, { text: messageText, mentions }, { quoted: m.quoted });
    } catch (e) {
      console.log(e);
      m.reply(`${e}`);
    }
  }
);

// Command: tagadm - Mentions only group admins.
cmd(
  {
    pattern: "tagadm",
    desc: "Mentions only group admins",
    category: "group",
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, isGroup, groupMetadata }) => {
    try {
      if (!isGroup) return reply("_This command is for groups_");

      const adminParticipants = groupMetadata.participants.filter((p) => p.admin);
      if (!adminParticipants.length) return reply("_No admins found in this group._");

      let text = `👑 *Group Admins:* 👑\n`;
      adminParticipants.forEach((p, index) => {
        text += `${index + 1}. @${p.name ? p.name : p.id.split("@")[0]}\n`;
      });
      await conn.sendMessage(from, { text, mentions: adminParticipants.map((p) => p.id) });
    } catch (e) {
      console.log(e);
      m.reply(`${e}`);
    }
  }
);

// Command: groupinfo - Displays group information.
