const fs = require("fs");
const axios = require("axios");
const { cmd } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;

const dbPath = "./lib/wcg-database.json";
const timers = {};

function loadDB() {
  if (!fs.existsSync(dbPath)) return {};
  const data = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(data || "{}");
}

function saveDB(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

async function isValidWord(word) {
  try {
    const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
    return Array.isArray(res.data);
  } catch {
    return false;
  }
}

cmd({
  pattern: "wcg",
  desc: "Start a Word Chain Game",
  category: "game",
  filename: __filename
}, async (conn, mek, m, { from, reply, sender }) => {
  const db = loadDB();

  if (db[from] && !db[from].finished && !db[from].waiting) {
    return reply("⚠️ A Word Chain game is already active.");
  }

  db[from] = {
    type: "wcg",
    players: [sender],
    words: [],
    turn: 1,
    waiting: true,
    finished: false
  };

  saveDB(db);

  return reply(`🔗 *Word Chain Game Started!*\n👤 Player 1: @${sender.split("@")[0]}\n⏳ Waiting for Player 2...\nSend *join-wcg* to join this game!`, null, { mentions: [sender] });
});

cmd({
  pattern: "cancel-wcg",
  desc: "Cancel the Word Chain Game",
  category: "game",
  filename: __filename
}, async (conn, mek, m, { from, reply, sender }) => {
  const db = loadDB();

  if (!db[from] || db[from].type !== "wcg") return reply("⚠️ No active Word Chain game to cancel.");
  if (db[from].players[0] !== sender) return reply("⛔ Only the game creator can cancel the game.");

  const mentions = db[from].players;
  delete db[from];
  saveDB(db);
  clearTimeout(timers[from]);
  delete timers[from];

  return reply(`❌ Game cancelled by @${sender.split("@")[0]}`, null, { mentions });
});

cmd({
  pattern: "leave-wcg",
  desc: "Leave the Word Chain Game",
  category: "game",
  filename: __filename
}, async (conn, mek, m, { from, reply, sender }) => {
  const db = loadDB();
  if (!db[from] || db[from].type !== "wcg") return reply("⚠️ No active Word Chain game to leave.");
  if (!db[from].players.includes(sender)) return reply("⚠️ You are not part of the game.");

  const other = db[from].players.find(p => p !== sender);
  delete db[from];
  saveDB(db);

  return reply(`🚪 @${sender.split("@")[0]} left the game. Game cancelled.`, null, { mentions: [sender, other].filter(Boolean) });
});

cmd({
  pattern: "join-wcg",
  desc: "Join a Word Chain Game",
  category: "game",
  filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
  const db = loadDB();
  const game = db[from];

  if (!game || game.type !== "wcg") return reply("❌ No Word Chain game to join.");
  if (!game.waiting) return reply("⚠️ Game already started.");
  if (game.players.includes(sender)) return reply("⚠️ You already joined the game.");

  game.players.push(sender);
  game.waiting = false;
  game.lastMoveTime = Date.now();

  saveDB(db);

  return reply(`🙌 @${sender.split("@")[0]} joined the game!\n🔤 Word Chain starts!\n\n@${game.players[0].split("@")[0]} starts the game.\nSend a valid English word.`, null, { mentions: game.players });
});

cmd({
  on: "body"
}, async (conn, mek, m, { from, body, sender, reply }) => {
  const text = body.trim().toLowerCase();
  const db = loadDB();
  const game = db[from];

  if (!game || game.type !== "wcg") return;

  // جلوگیری از اسپم با بررسی زمان آخرین پیام
  const now = Date.now();
  if (!game.lastMoveTime) game.lastMoveTime = now;
  const timeSinceLast = now - game.lastMoveTime;
  if (timeSinceLast < 1500) return; // کمتر از 1.5 ثانیه → رد کن

  // join-wcg logic
  if (text === "join-wcg") {
    if (!game.waiting) return; // بازی شروع شده
    if (game.players.includes(sender)) return; // بازیکن قبلاً جوین داده

    game.players.push(sender);
    game.waiting = false;
    game.lastMoveTime = Date.now(); // ثبت زمان شروع بازی

    saveDB(db);

    return reply(`🙌 @${sender.split("@")[0]} joined the game!\n🔤 Word Chain starts!\n\n@${game.players[0].split("@")[0]} starts the game.\nSend a valid English word.`, null, { mentions: game.players });
  }

  // بررسی اینکه بازی در انتظار بازیکن دوم نباشه
  if (game.waiting || !game.players.includes(sender) || game.finished) return;

  // بررسی نوبت
  const playerIndex = game.turn - 1;
  if (game.players[playerIndex] !== sender) return;

  const word = text.toLowerCase();

  if (!/^[a-z]{2,}$/.test(word)) return reply("⚠️ Only alphabetic English words with at least 2 letters are allowed.");
  if (game.words.includes(word)) return reply("⚠️ Word already used!");
  if (!(await isValidWord(word))) return reply("❌ Invalid English word!");

  if (game.words.length > 0) {
    const lastWord = game.words[game.words.length - 1];
    if (lastWord[lastWord.length - 1] !== word[0]) {
      return reply(`⚠️ Your word must start with *${lastWord[lastWord.length - 1]}*`);
    }
  }

  game.words.push(word);
  game.turn = game.turn === 1 ? 2 : 1;
  game.lastMoveTime = Date.now(); // ثبت زمان آخرین حرکت

  // تایمر برای بازیکن بعدی
  clearTimeout(timers[from]);
  timers[from] = setTimeout(() => {
    const db = loadDB();
    if (db[from]) {
      const loser = db[from].players[db[from].turn - 1];
      const winner = db[from].players.find(p => p !== loser);
      conn.sendMessage(from, {
        text: `⌛ *Timeout!*\n@${loser.split("@")[0]} took too long.\n🏆 @${winner.split("@")[0]} wins!`,
        mentions: db[from].players
      });
      delete db[from];
      saveDB(db);
      delete timers[from];
    }
  }, 10 * 60 * 1000); // 10 دقیقه

  saveDB(db);
  return reply(`✅ Word accepted: *${word}*\n🪢 Next player: @${game.players[game.turn - 1].split("@")[0]}`, null, { mentions: game.players });
});
