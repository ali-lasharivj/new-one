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
  alias: ["botdp", "botpic", "botimage"],
  desc: "Set the bot's image URL",
  category: "owner",
  react: "✅",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
  try {
    if (!isCreator) return reply("❗ Only the bot owner can use this command.");

    let imageUrl = args[0];

    // Upload image if replying to one
    if (!imageUrl && m.quoted) {
      const quotedMsg = m.quoted;
      const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';
      if (!mimeType.startsWith("image")) return reply("❌ Please reply to an image.");

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

    await setConfig("MENU_IMAGE_URL", imageUrl);

    await reply(`✅ Bot image updated.\n\n*New URL:* ${imageUrl}\n\n♻️ Restarting...`);
    setTimeout(() => exec("pm2 restart all"), 2000);

  } catch (err) {
    console.error(err);
    reply(`❌ Error: ${err.message || err}`);
  }
});

// SET PREFIX
cmd({
  pattern: "setprefix",
  alias: ["prefix", "prifix"],
  desc: "Set the bot's command prefix",
  category: "owner",
  react: "✅",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
  if (!isCreator) return reply("❗ Only the bot owner can use this command.");
  const newPrefix = args[0]?.trim();
  if (!newPrefix || newPrefix.length > 2) return reply("❌ Provide a valid prefix (1–2 characters).");

  await setConfig("PREFIX", newPrefix);

  await reply(`✅ Prefix updated to: *${newPrefix}*\n\n♻️ Restarting...`);
  setTimeout(() => exec("pm2 restart all"), 2000);
});



// SET BOT NAME
cmd({
  pattern: "setbotname",
  alias: ["botname"],
  desc: "Set the bot's name",
  category: "owner",
  react: "✅",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
  if (!isCreator) return reply("❗ Only the bot owner can use this command.");
  const newName = args.join(" ").trim();
  if (!newName) return reply("❌ Provide a bot name.");

  await setConfig("BOT_NAME", newName);

  await reply(`✅ Bot name updated to: *${newName}*\n\n♻️ Restarting...`);
  setTimeout(() => exec("pm2 restart all"), 2000);
});

    cmd({
    pattern: "mode",
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
