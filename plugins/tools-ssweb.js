const axios = require("axios");
const config = require('../config');
const { cmd } = require("../command");


cmd({
  pattern: "screenshot",
  react: "🌐",
  alias: ["ss", "ssweb"],
  desc: "Capture a full-page screenshot of a website.",
  category: "search",
  use: ".screenshot <url>",
  filename: __filename,
}, async (conn, mek, msg, { from, args, reply }) => {
  try {
    const url = args[0];
    if (!url) {
      return reply("*🧋 ρℓєαѕє ρʀσνι∂є α ναℓι∂ υʀℓ. єχαмρℓє: `.ѕ¢ʀєєɴѕнσт`* https://ali-web-rho.vercel.app/");
    }

    // Validate the URL
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return reply("*❌ Invalid URL. Please include 'http://' or 'https://'.*");
    }

    // Generate the screenshot URL using Thum.io API
    const screenshotUrl = `https://image.thum.io/get/fullpage/${url}`;

    // Send the screenshot as an image message
    await conn.sendMessage(from, {
      image: { url: screenshotUrl },
      caption: `*🧃ωєвѕιтє ᴜʀℓ:*\n${url}\n> *© ᴘσωєʀє∂ ву αℓι м∂⎯꯭̽🐍*`,
      contextInfo: {
        mentionedJid: [msg.sender], // Fix: Use `msg.sender` instead of `m.sender`
        forwardingScore: 999,
        isForwarded: false,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363304325671080@newsletter',
          newsletterName: "ALI-MD",
          serverMessageId: 143,
        },
      },
    }, { quoted: mek });

  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    reply("❌ Failed to capture the screenshot. Please try again.");
  }
});
          
