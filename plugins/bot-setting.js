const { cmd, commands } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions');
const { writeFileSync } = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const axios = require('axios');
const FormData = require('form-data');
const { setConfig, getConfig } = require("../lib/configdb");



// SET BOT IMAGE
cmd({
  pattern: "setbotimage",
  alias: ["botdp","botpp"],
  desc: "Set the bot's image URL",
  category: "owner",
  react: "✅",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
  try {
    if (!isCreator) return reply("*📛 σɴℓу тнє σωɴɴɴєʀ ¢αɴ υѕє тнιѕ ¢σммαɴ∂!*");

    let imageUrl = args[0];

    // Upload image if replying to one
    if (!imageUrl && m.quoted) {
      const quotedMsg = m.quoted;
      const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';
      if (!mimeType.startsWith("image")) return reply("*🖼️ ρℓєαѕє ʀєρℓу тσ αɴ ιмαgє*");

      const mediaBuffer = await quotedMsg.download();
      const extension = mimeType.includes("jpeg") ? ".jpg" : ".png";
      const tempFilePath = path.join(os.tmpdir(), `botimg_${Date.now()}${extension}`);
      fs.writeFileSync(tempFilePath, mediaBuffer);

      const form = new FormData();
      form.append("fileToUpload", fs.createReadStream(tempFilePath), `botimage${extension}`);
      form.append("reqtype", "fileupload");

      const response = await axios.post("https://catbox.moe/user/api.php", form, {
        headers: form.getHeaders()
      });

      fs.unlinkSync(tempFilePath);

      if (typeof response.data !== 'string' || !response.data.startsWith('https://')) {
        throw new Error(`Catbox upload failed: ${response.data}`);
      }

      imageUrl = response.data;
    }

    if (!imageUrl || !imageUrl.startsWith("http")) {
      return reply("❌ Provide a valid image URL or reply to an image.");
    }

    await setConfig("ALIVE_IMG", imageUrl);

    await reply(`*✅ вσт ιмαgє υρ∂αтє∂*`);
    setTimeout(() => exec("pm2 restart all"), 2000);

  } catch (err) {
    console.error(err);
    reply(`❌ Error: ${err.message || err}`);
  }
});

// SET PREFIX
cmd({
  pattern: "setprefix",
  alias: ["prefix"],
  desc: "Set the bot's command prefix",
  category: "owner",
  react: "✅",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
  if (!isCreator) return reply("*📛 σɴℓу тнє σωɴɴɴєʀ ¢αɴ υѕє тнιѕ ¢σммαɴ∂!*");
  const newPrefix = args[0]?.trim();
  if (!newPrefix || newPrefix.length > 2) return reply("*🛠️ ρʀσνι∂є α ναℓι∂ ρʀєfιχ*).");

  await setConfig("PREFIX", newPrefix);

  await reply(`*✅ ρʀєfιχ υρ∂αтє∂ тσ:*${newPrefix}*`);
  setTimeout(() => exec("pm2 restart all"), 2000);
});

// SET BOT NAME
cmd({
  pattern: "setbotname",
  desc: "Set the bot's name",
  category: "owner",
  react: "✅",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
  if (!isCreator) return reply("*📛 σɴℓу тнє σωɴɴɴєʀ ¢αɴ υѕє тнιѕ ¢σммαɴ∂!*");
  const newName = args.join(" ").trim();
  if (!newName) return reply("*🔖 ρʀσνι∂є α вσт ɴαмє*");

  await setConfig("BOT_NAME", newName);

  await reply(`*✅ вσт ɴαмє υρ∂αтє∂ тσ: ${newName}*`);
  setTimeout(() => exec("pm2 restart all"), 2000);
});

let antibotAction = "off"; // Default action is off
let warnings = {}; // Store warning counts per user

cmd({
    pattern: "antibot",
    react: "🫟",
    alias: ["antibot"],
    desc: "Enable Antibot and set action (off/warn/delete/kick)",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { q, reply }) => {
    if (!q) {
        return reply(`*📛 єχαмρℓє .αɴтιвσт ωαʀɴ/∂єℓєтє/кι¢к*`);
    }

    const action = q.toLowerCase();
    if (["off", "warn", "delete", "kick"].includes(action)) {
        antibotAction = action;
        return reply(`*✅αɴтιвσт α¢тισɴ ѕєт тσ: ${action.toUpperCase()}*`);
    } else {
        return reply("*📛 єχαмρℓє .αɴтιвσт ωαʀɴ/∂єℓєтє/кι¢к*");
    }
});

cmd({
    on: "body"
}, async (conn, mek, m, { from, isGroup, sender, isBotAdmins, isAdmins, reply }) => {
    if (!isGroup || antibotAction === "off") return; // Check if antibot is enabled

    const messageId = mek.key.id;
    if (!messageId || !messageId.startsWith("31F")) return; // Detect bot-generated messages

    if (!isBotAdmins) return reply("*📛 ι ɴєє∂ тσ вє αɴ α∂мιɴ тσ ᴜѕє тнιѕ ᴄσммαɴ∂.*");
    if (isAdmins) return; // Ignore admins

    await conn.sendMessage(from, { delete: mek.key }); // Delete the detected bot message

    switch (antibotAction) {
        case "kick":
            await conn.groupParticipantsUpdate(from, [sender], "remove");
            break;

        case "warn":
            warnings[sender] = (warnings[sender] || 0) + 1;
            if (warnings[sender] >= 3) {
                delete warnings[sender]; // Reset warning count after kicking
                await conn.groupParticipantsUpdate(from, [sender], "remove");
            } else {
                return reply(`*🤖 вσт αʀє ɴσт αℓℓσωє∂ 🤖*\n*╭────⬡ ᴡαʀɴιɴg ⬡────*\n*├▢ ᴜsєʀ :* @${sender.split("@")[0]}!\n*├▢ ᴄσᴜɴᴛ : ${warnings[sender]}*\n*├▢ ʀєαѕσɴ : вσт ɴσт αℓℓσωє∂*\n*├▢ ᴡαʀɴ ℓιмιт : 3*\n*╰────────────────*`, { mentions: [sender] });
            }
            break;
    }
});


 
cmd({
    pattern: "mod",
    alias: ["setmode"],
    react: "🔐",
    desc: "Set bot mode to private or public.",
    category: "settings",
    filename: __filename,
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("*📛 Only the owner can use this command!*");

    const currentMode = getConfig("MODE") || "public";

    if (!args[0]) {
        return reply(`📌 Current mode: *${currentMode}*\n\nUsage: .mode private OR .mode public`);
    }

    const modeArg = args[0].toLowerCase();

    if (["private", "public"].includes(modeArg)) {
        setConfig("MODE", modeArg);
        await reply(`✅ Bot mode is now set to *${modeArg.toUpperCase()}*.\n\n♻ Restarting bot to apply changes...`);

        exec("pm2 restart all", (error, stdout, stderr) => {
            if (error) {
                console.error("Restart error:", error);
                return;
            }
            console.log("PM2 Restart:", stdout || stderr);
        });
    } else {
        return reply("❌ Invalid mode. Please use `.mode private` or `.mode public`.");
    }
});

cmd({
    pattern: "auto-react",
    alias: ["autoreact"],
    react: "🍧",
    desc: "Set bot mode to private or public.",
    category: "settings",
    filename: __filename,
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("*📛 Only the owner can use this command!*");

    const currentMode = getConfig("AUTO_REACT") || "false";

    if (!args[0]) {
        return reply(`📌 Current mode: *${currentMode}*\n\nUsage: .mode private OR .mode public`);
    }

    const modeArg = args[0].toLowerCase();

    if (["true", "false"].includes(modeArg)) {
        setConfig("AUTO_REACT", modeArg);
        await reply(`✅ Bot mode is now set to *${modeArg.toUpperCase()}*.\n\n♻ Restarting bot to apply changes...`);

        exec("pm2 restart all", (error, stdout, stderr) => {
            if (error) {
                console.error("Restart error:", error);
                return;
            }
            console.log("PM2 Restart:", stdout || stderr);
        });
    } else {
        return reply("❌ Invalid mode. Please use `.mode private` or `.mode public`.");
    }
});
