const fs = require("fs");
const axios = require("axios");
const { cmd } = require("../command");

const dbFile = "./lib/wcg-database.json";

function loadDB() {
  if (!fs.existsSync(dbFile)) return {};
  const data = fs.readFileSync(dbFile, "utf-8");
  return JSON.parse(data || "{}");
}

function saveDB(db) {
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
}

function getLetter(word) {
  return word[word.length - 1].toUpperCase();
}

async function isValidWordAPI(word) {
  try {
    const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
    return Array.isArray(res.data);
  } catch {
    return false;
  }
}

function newRound(game, send, player, nextPlayer) {
  const lastWord = game.words.length ? game.words[game.words.length - 1] : '';
  const letter = getLetter(lastWord || game.letter || 'A');
  const minLength = 3 + Math.floor(game.words.length / 2);
  game.turn = player;
  game.next = nextPlayer;
  game.letter = letter;
  game.minLength = minLength;

  send(
    `🎲 Turn: @${player.split("@")[0]}\n` +
    `🙌 Next: @${nextPlayer.split("@")[0]}\n` +
    `🆎 Your word must start with *${letter}* and be at least *${minLength}* letters\n` +
    `🏆 Players remaining: ${game.players.length}/${game.originalPlayers.length}\n` +
    `⏳ You have *35s* to answer\n` +
    `📝 Total words: ${game.words.length}`
  );

  clearTimeout(game.timer);
  game.timer = setTimeout(() => {
    send(`@${player.split("@")[0]} ran out of time! They're out! 🚫`);
    game.players = game.players.filter(p => p !== player);

    if (game.players.length === 1) {
      send(`@${game.players[0].split("@")[0]} Won 🏆\nWords: *${game.words.length}*`);
      delete game.active;
      delete game.turn;
      delete game.next;
      delete game.timer;
      delete game.letter;
      delete game.minLength;

      const db = loadDB();
      delete db[game.id];
      saveDB(db);
      return;
    }

    const currentIndex = 0; // چون اولین بازیکن در آرایه بازی هست
    const nextIndex = 1 % game.players.length;
    newRound(game, send, game.players[currentIndex], game.players[nextIndex]);

    const db = loadDB();
    db[game.id] = game;
    saveDB(db);
  }, 35000);
}

// در تایمر 60 ثانیه join:

setTimeout(() => {
  const db2 = loadDB();
  const game2 = db2[from];
  if (!game2 || !game2.active) return;

  if (game2.players.length < 2) {
    reply("⛔ Not enough players. Game cancelled.");
    delete db2[from];
    saveDB(db2);
    return;
  }
  reply(`🎮 Game starting with ${game2.players.length} players.`);
  const p1 = game2.players[0];
  const p2 = game2.players.length > 1 ? game2.players[1] : game2.players[0];
  newRound(game2, reply, p1, p2);
  saveDB(db2);
}, 60000);

// در هندل کلمه:

game.words.push(text);

if (game.words.length >= 10) {
  reply(`🏆 Game over! @${sender.split("@")[0]} won by completing 10 words! 🎉`, null, {
    mentions: [sender],
  });
  delete db[from];
  saveDB(db);
  return;
}

const currentIndex = game.players.indexOf(sender);
const nextIndex = (currentIndex + 1) % game.players.length;

newRound(game, reply, game.players[nextIndex], game.players[(nextIndex + 1) % game.players.length]);

saveDB(db);

// شروع بازی
cmd({
  pattern: "wcg",
  desc: "Start Word Chain Game",
  category: "game",
  filename: __filename,
  fromMe: true,
}, async (conn, mek, m, { from, sender, reply }) => {
  const db = loadDB();
  const game = db[from];
  if (game && game.active) return reply("A game is already active!");

  db[from] = {
    id: from,
    active: true,
    players: [sender],
    originalPlayers: [sender],
    words: [],
    turn: null,
    next: null,
    timer: null,
    letter: null,
    minLength: 3,
    alreadyJoinedMsgs: {},
  };
  saveDB(db);
  reply(
    `🎮 Game starting...\n👥 Needs 2 or more players 🙋‍♂️🙋‍♀️\n⏳ 60 seconds left to join ⏳\n🧩 Mode easy`
  );

  // تایمر 60 ثانیه برای جوین شدن بازیکن ها
  setTimeout(() => {
    const db2 = loadDB();
    const game2 = db2[from];
    if (!game2 || !game2.active) return;

    if (game2.players.length < 2) {
      reply("⛔ Not enough players. Game cancelled.");
      delete db2[from];
      saveDB(db2);
      return;
    }
    reply(`🎮 Game starting with ${game2.players.length} players.`);
    const [p1, p2] = game2.players;
    newRound(game2, reply, p1, p2);
    saveDB(db2);
  }, 60000);
});

// جوین شدن بازیکن
cmd({
  pattern: "joinwc",
  desc: "Join Word Chain Game",
  category: "game",
  filename: __filename,
  fromMe: false,
  on: "body",
}, async (conn, mek, m, { from, sender, reply }) => {
  const db = loadDB();
  const game = db[from];

  // اگر بازی فعال نیست یا نوبت شروع شده (turn != null) اجازه جوین ندید
  if (!game || !game.active || game.turn) {
    return reply("⚠️ No Word Chain game is waiting for players here. Start a game with 'wcg'.");
  }

  if (!game.alreadyJoinedMsgs) {
    game.alreadyJoinedMsgs = {};
  }

  if (game.players.includes(sender)) {
    // پیام You already joined فقط یکبار به هر بازیکن ارسال شود
    if (!game.alreadyJoinedMsgs[sender]) {
      game.alreadyJoinedMsgs[sender] = true;
      saveDB(db);
      return reply("You already joined!");
    }
    return; // پیام تکراری نفرست
  }

  game.players.push(sender);
  game.originalPlayers.push(sender);
  saveDB(db);
  reply(`@${sender.split("@")[0]} Joined 👏`);
});

// هندل کلمات بازی
cmd({
  on: "body",
}, async (conn, mek, m, { from, body, sender, reply }) => {
  const db = loadDB();
  const text = body.trim().toLowerCase();
  const game = db[from];
  if (!game || !game.active || !game.turn) return;
  if (sender !== game.turn) return;

  if (!text.startsWith(game.letter.toLowerCase())) {
    return reply(`_Not starting with "${game.letter}"_`);
  }

  if (text.length < game.minLength) {
    return reply(`_Word length should be at least ${game.minLength}_`);
  }

  if (game.words.includes(text)) {
    return reply("_Word already used!_");
  }

  const valid = await isValidWordAPI(text);
  if (!valid) {
    return reply("_This is not a valid English word_");
  }

  game.words.push(text);

  if (game.words.length >= 10) {
    reply(`🏆 Game over! @${sender.split("@")[0]} won by completing 10 words! 🎉`, null, {
      mentions: [sender],
    });
    delete db[from];
    saveDB(db);
    return;
  }

  const currentIndex = game.players.indexOf(sender);
  const nextIndex = (currentIndex + 1) % game.players.length;
  game.turn = game.players[nextIndex];
  game.letter = text[text.length - 1].toLowerCase();

  saveDB(db);

  reply(
    `🟢 New round!\n\nCurrent word: *${text}*\nNext letter: *${game.letter.toUpperCase()}*\n\n@${game.turn.split("@")[0]}, your turn!`,
    null,
    { mentions: [game.turn] }
  );
});