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
    finished: false,
    wordLimit: 3
  };

  saveDB(db);

  return reply(`🎮 *Word Chain Game Started!*\n👤 Player 1: @${sender.split("@")[0]}\n⏳ Waiting for Player 2...\n\nTo join, send: *join-wcg*`, null, { mentions: [sender] });
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

  return reply(
    `🙌 @${sender.split("@")[0]} joined the game!\n\n🧠 *Word Chain Begins!*\n🎯 @${game.players[0].split("@")[0]} starts.\n📌 Send an English word starting with any letter.\n📏 Min word length: *3 letters*`,
    null,
    { mentions: game.players }
  );
});

cmd({
  on: "body"
}, async (conn, mek, m, { from, body, sender, reply }) => {
  const text = body.trim().toLowerCase();
  const db = loadDB();
  const game = db[from];

  if (!game || game.type !== "wcg" || game.waiting || !game.players.includes(sender) || game.finished) return;

  const now = Date.now();
  if (!game.lastMoveTime) game.lastMoveTime = now;
  if (now - game.lastMoveTime < 1500) return;

  const playerIndex = game.turn - 1;
  if (game.players[playerIndex] !== sender) return;

  const word = text.toLowerCase();

  if (!/^[a-z]{2,}$/.test(word)) return reply("⚠️ Only alphabetic English words are allowed.");
  if (word.length < game.wordLimit) return reply(`📏 Word must be at least *${game.wordLimit}* letters.`);
  if (game.words.includes(word)) return reply("♻️ Word already used!");
  if (!(await isValidWord(word))) return reply("❌ Not a valid English word!");

  if (game.words.length > 0) {
    const lastWord = game.words[game.words.length - 1];
    if (lastWord[lastWord.length - 1] !== word[0]) {
      return reply(`🔁 Word must start with *${lastWord[lastWord.length - 1].toUpperCase()}*`);
    }
  }

  game.words.push(word);
  game.turn = game.turn === 1 ? 2 : 1;
  game.wordLimit = Math.min(game.wordLimit + 1, 20); // grow min length gradually
  game.lastMoveTime = now;

  // If 10 words, finish
  if (game.words.length >= 10) {
    const winner = sender;
    const loser = game.players.find(p => p !== sender);
    reply(`🏁 *Game Over!*\n🥇 Winner: @${winner.split("@")[0]}\n📜 Total Words: ${game.words.length}\n🧩 Words: ${game.words.join(", ")}`, null, { mentions: game.players });
    delete db[from];
    saveDB(db);
    clearTimeout(timers[from]);
    delete timers[from];
    return;
  }

  // Set 2-minute timer
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
  }, 2 * 60 * 1000); // 2 minutes

  saveDB(db);

  return reply(
    `✅ *${word}* accepted!\n🧮 This was word *${game.words.length}* of 10.\n🔠 Your next word must start with *${word[word.length - 1].toUpperCase()}*\n➡️ @${game.players[game.turn - 1].split("@")[0]}, your turn!\n📏 Word must be at least *${game.wordLimit}* letters.\n⏳ You have *2 minutes* to respond.`,
    null,
    { mentions: game.players }
  );
});
