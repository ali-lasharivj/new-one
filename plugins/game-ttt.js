const fs = require("fs");
const { cmd } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;

const dbPath = "./lib/ttt-database.json";

function loadDB() {
  if (!fs.existsSync(dbPath)) return {};
  const data = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(data || "{}");
}

function saveDB(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function renderBoard(board) {
  const emojis = [" ", "❌", "⭕"];
  const lines = [];
  for (let i = 0; i < 3; i++) {
    const row = board.slice(i * 3, i * 3 + 3)
      .map((v, idx) => v ? emojis[v] : `${i * 3 + idx + 1}️⃣`).join(" ┃ ");
    lines.push("┃ " + row + " ┃");
  }
  const sep = "┄┄┄┄┄┄┄┄┄┄┄";
  return (
    `┄┄┄┄┄┄┄┄┄┄┄\n` +
    lines.join("\n" + sep + "\n") +
    `\n┄┄┄┄┄┄┄┄┄┄┄`
  );
}

function checkWin(board, player) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return wins.some(line => line.every(i => board[i] === player));
}

function checkDraw(board) {
  return board.every(c => c !== 0);
}

function gameMessage(game, mention1, mention2) {
  return `🎮 *TIC-TAC-TOE* 🎮\n\nGame between ${mention1} (❌) and ${mention2} (⭕)\n\n${renderBoard(game.board)}\n\n${game.turn === 1 ? mention1 : mention2}'s turn (${game.turn === 1 ? "❌" : "⭕"})\n\nSend a number (1-9) to make your move.`;
}

// شروع بازی
cmd({
  pattern: "ttt",
  desc: "Start a Tic-Tac-Toe game",
  category: "game",
  filename: __filename
}, async (conn, mek, m, { from, reply, sender }) => {
  let db = loadDB();

  if (db[from] && !db[from].finished && !db[from].waiting) {
    return reply("⚠️ A game is already active here. Finish it before starting a new one.");
  }

  if (db[from] && db[from].waiting) {
    return reply("⚠️ A game is already waiting for the second player. Send 'join' to join the game.");
  }

  db[from] = {
    waiting: true,
    players: [sender],
    board: Array(9).fill(0),
    turn: 1,
    finished: false
  };
  saveDB(db);

  reply(`🎮 Tic-Tac-Toe game started!\n\nPlayer 1: @${sender.split("@")[0]}\nWaiting for player 2 to join... Send 'join' to join the game.`, null, { mentions: [sender] });
});

// پیوستن نفر دوم
cmd({
  pattern: "join",
  desc: "Join a Tic-Tac-Toe game",
  category: "game",
  filename: __filename
}, async (conn, mek, m, { from, reply, sender }) => {
  let db = loadDB();

  if (!db[from] || !db[from].waiting) {
    return reply("⚠️ No Tic-Tac-Toe game is waiting for players here. Start a game with 'ttt'.");
  }

  if (db[from].players.includes(sender)) {
    return reply("⚠️ You are already in the game.");
  }

  db[from].players.push(sender);
  db[from].waiting = false;
  saveDB(db);

  const player1 = db[from].players[0];
  const player2 = db[from].players[1];

  await reply(`🎮 Player 2 @${sender.split("@")[0]} joined the game!\n\n${gameMessage(db[from], `@${player1.split("@")[0]}`, `@${player2.split("@")[0]}`)}`, null, { mentions: [player1, player2] });
});

// مدیریت حرکات بازی
cmd({
  on: "body"
}, async (conn, mek, m, { from, body, sender, reply }) => {
  const db = loadDB();
  const text = body.trim().toLowerCase();

  // دستور شروع بازی
  if (text === "ttt") {
    if (db[from] && !db[from].finished && !db[from].waiting) {
      return reply("⚠️ A game is already active here. Finish it before starting a new one.");
    }
    if (db[from] && db[from].waiting) {
      return reply("⚠️ A game is already waiting for the second player. Send 'join' to join the game.");
    }

    db[from] = {
      waiting: true,
      players: [sender],
      board: Array(9).fill(0),
      turn: 1,
      finished: false
    };
    saveDB(db);

    return reply(`🎮 Tic-Tac-Toe game started!\n\nPlayer 1: @${sender.split("@")[0]}\nWaiting for player 2 to join... Send 'join' to join the game.`, null, { mentions: [sender] });
  }

  // دستور join
  if (text === "join") {
    if (!db[from] || !db[from].waiting) {
      return reply("⚠️ No Tic-Tac-Toe game is waiting for players here. Start a game with 'ttt'.");
    }

    if (db[from].players.includes(sender)) {
      return reply("⚠️ You are already in the game.");
    }

    db[from].players.push(sender);
    db[from].waiting = false;
    saveDB(db);

    const player1 = db[from].players[0];
    const player2 = db[from].players[1];

    return reply(`🎮 Player 2 @${sender.split("@")[0]} joined the game!\n\n${gameMessage(db[from], `@${player1.split("@")[0]}`, `@${player2.split("@")[0]}`)}`, null, { mentions: [player1, player2] });
  }

  // ادامه بازی
  const game = db[from];
  if (!game || game.waiting || game.finished) return;
  if (!game.players.includes(sender)) return;
  if (sender !== game.players[game.turn - 1]) return;

  const move = parseInt(body);
  if (!move || move < 1 || move > 9) return;

  if (game.board[move - 1] !== 0) {
    return reply("⚠️ This cell is already taken. Choose another one.");
  }

  game.board[move - 1] = game.turn;

  if (checkWin(game.board, game.turn)) {
    const winnerMention = `@${game.players[game.turn - 1].split("@")[0]}`;
    await reply(`🎉 ${winnerMention} (${game.turn === 1 ? "❌" : "⭕"}) has won the game! 🎉\n\n${renderBoard(game.board)}`, null, { mentions: game.players });
    delete db[from];
    saveDB(db);
    return;
  }

  if (checkDraw(game.board)) {
    await reply(`🤝 The game ended in a draw.\n\n${renderBoard(game.board)}`, null, { mentions: game.players });
    delete db[from];
    saveDB(db);
    return;
  }

  game.turn = game.turn === 1 ? 2 : 1;
  saveDB(db);

  const mention1 = `@${game.players[0].split("@")[0]}`;
  const mention2 = `@${game.players[1].split("@")[0]}`;
  await reply(gameMessage(game, mention1, mention2), null, { mentions: game.players });
});
