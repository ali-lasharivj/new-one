const fs = require("fs");
const { cmd } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;

const dbPath = "./lib/ttt-database.json";
const timers = {}; // تایمرهای نوبت


const waitingIntervals = {};
const waitingTimeouts = {};

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
  return `┄┄┄┄┄┄┄┄┄┄┄\n${lines.join("\n" + sep + "\n")}\n┄┄┄┄┄┄┄┄┄┄┄`;
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
    return reply("⚠️ A game is already waiting for the second player. Send 'join-ttt' to join the game.");
  }

  db[from] = {
    waiting: true,
    players: [sender],
    board: Array(9).fill(0),
    turn: 1,
    finished: false
  };
  saveDB(db);
  
  const dbReloaded = loadDB();
  const player1Jid = sender;
  const player1Name = await conn.getName(player1Jid);
  const player1Mention = `@${player1Jid.split("@")[0]}`;
  reply(`🎮 *Tic-Tac-Toe* game started!\n\n👤 Player 1: ${player1Name} (${player1Mention})\n⏳ Waiting for player 2 to join...\n\n✉️ Send *join-ttt* to join the game!\n\n⏰ *Note:* If no one joins within 40 seconds, the game will be cancelled automatically.\n\nYou will receive reminders every 60 seconds.`, null, {
    mentions: [player1Jid]
  });

  // تایمر یادآوری هر 60 ثانیه
  if (waitingIntervals[from]) clearInterval(waitingIntervals[from]);
  waitingIntervals[from] = setInterval(() => {
    conn.sendMessage(from, { text: "⏳ Waiting for player 2 to join... Send 'join-ttt' to join the game." });
  }, 60 * 1000);

  // تایمر لغو بازی پس از 40 ثانیه
  if (waitingTimeouts[from]) clearTimeout(waitingTimeouts[from]);
  waitingTimeouts[from] = setTimeout(() => {
    let db = loadDB();
    if (db[from] && db[from].waiting) {
      conn.sendMessage(from, { text: "⌛️ Game cancelled automatically because no player 2 joined within 40 seconds." });
      delete db[from];
      saveDB(db);

      clearInterval(waitingIntervals[from]);
      clearTimeout(waitingTimeouts[from]);
      delete waitingIntervals[from];
      delete waitingTimeouts[from];
    }
  }, 40 * 1000);
});

// خروج از بازی
cmd({
  pattern: "leave-ttt",
  desc: "Leave the current Tic-Tac-Toe game",
  category: "game",
  filename: __filename
}, async (conn, mek, m, { from, reply, sender }) => {
  const db = loadDB();

  if (!db[from]) return reply("⚠️ No active game to leave.");

  const game = db[from];

  if (!game.players.includes(sender)) return reply("⚠️ You are not part of the game.");

  const other = game.players.find(p => p !== sender);
  const senderTag = `@${sender.split("@")[0]}`;

  if (timers[from]) {
    clearTimeout(timers[from]);
    delete timers[from];
  }

  delete db[from];
  saveDB(db);

  return reply(`🚪 ${senderTag} left the game. Game cancelled.`, null, { mentions: [sender, other].filter(Boolean) });
});

// لغو بازی در حالت انتظار
cmd({
  pattern: "cancel-ttt",
  desc: "Cancel an ongoing Tic-Tac-Toe game",
  category: "game",
  filename: __filename
}, async (conn, mek, m, { from, reply, sender }) => {
  const db = loadDB();

  if (!db[from]) {
    return reply("⚠️ No ongoing Tic-Tac-Toe game to cancel.");
  }

  // اگر شماره ارسال کننده برابر شماره خاص باشد، اجازه کنسل بدون شرط داده شود
  if (sender !== db[from].players[0] && sender !== "2349133354644@s.whatsapp.net") {
    return reply("⚠️ Only the game starter or authorized user can cancel the game.");
  }

  if (timers[from]) {
    clearTimeout(timers[from]);
    delete timers[from];
  }

  delete db[from];
  saveDB(db);

  return reply("❌ Game cancelled successfully.");
});



cmd({
  on: "body"
}, async (conn, mek, m, { from, body, pushname, sender, reply }) => {
  const db = loadDB();
  const text = body.trim().toLowerCase();

  // Join the Tic-Tac-Toe game
  if (text === "join-ttt") {
    if (!db[from] || !db[from].waiting) {
      return reply("⚠️ No Tic-Tac-Toe game is currently waiting for players here. Start a game with 'ttt'.");
    }

    if (db[from].players.includes(sender)) {
      return reply("⚠️ You are already participating in this game.");
    }

    db[from].players.push(sender);
    db[from].waiting = false;
    saveDB(db);

    // Clear waiting timers since the game is starting now
    if (waitingIntervals[from]) {
      clearInterval(waitingIntervals[from]);
      delete waitingIntervals[from];
    }
    if (waitingTimeouts[from]) {
      clearTimeout(waitingTimeouts[from]);
      delete waitingTimeouts[from];
    }

    // Set move timer: 40 seconds per move before auto-cancel
    if (timers[from]) clearTimeout(timers[from]);
    timers[from] = setTimeout(() => {
      const dbReloaded = loadDB();
      if (dbReloaded[from] && !dbReloaded[from].finished) {
        const player1Mention = `@${dbReloaded[from].players[0].split("@")[0]}`;
        const player2Mention = `@${dbReloaded[from].players[1].split("@")[0]}`;
        conn.sendMessage(from, {
          text: `⌛️ *Game timed out!*\nNo move was made within 40 seconds.\nGame between ${player1Mention} and ${player2Mention} has been cancelled.`,
          mentions: dbReloaded[from].players
        });
        delete dbReloaded[from];
        saveDB(dbReloaded);
        delete timers[from];
      }
    }, 40 * 1000);

    const player1 = db[from].players[0];
    const player2 = db[from].players[1];

    return reply(
      `🎮 Player 2 @${sender.split("@")[0]} joined the game!\n\n${gameMessage(db[from], `@${player1.split("@")[0]}`, `@${player2.split("@")[0]}`)}`,
      null,
      { mentions: [player1, player2] }
    );
  }

  // Handle moves during an ongoing game
  const game = db[from];
  if (!game || game.waiting || game.finished) return; // No active game to play or waiting for join

  if (!game.players.includes(sender)) return; // Ignore messages from non-players

  // Check if it's the sender's turn
  if (sender !== game.players[game.turn - 1]) {
    return reply("⛔️ It is not your turn.");
  }

  // Validate move input as number 1-9
  const move = parseInt(body);
  if (isNaN(move) || move < 1 || move > 9) {
    return reply("⚠️ Invalid move. Please enter a number between 1 and 9 corresponding to an empty cell.");
  }

  // Check if the cell is already occupied
  if (game.board[move - 1] !== 0) {
    return reply("⚠️ This cell is already taken. Please choose another one.");
  }

  // Make the move
  game.board[move - 1] = game.turn;

  // Check for a win
  if (checkWin(game.board, game.turn)) {
    const winnerMention = `@${game.players[game.turn - 1].split("@")[0]}`;
    await reply(
      `🏆 *TIC-TAC-TOE RESULT* 🏆\n\n🎉 Congratulations ${winnerMention}!\nYou won the game playing as ${game.turn === 1 ? "❌" : "⭕"}.\n\n${renderBoard(game.board)}`,
      null,
      { mentions: game.players }
    );
    delete db[from];
    saveDB(db);
    if (timers[from]) {
      clearTimeout(timers[from]);
      delete timers[from];
    }
    return;
  }

  // Check for draw
  if (checkDraw(game.board)) {
    await reply(
      `🤝 The game ended in a draw.\n\n${renderBoard(game.board)}`,
      null,
      { mentions: game.players }
    );
    delete db[from];
    saveDB(db);
    if (timers[from]) {
      clearTimeout(timers[from]);
      delete timers[from];
    }
    return;
  }

  // Switch turns: if 1 then 2, else 1
  game.turn = game.turn === 1 ? 2 : 1;

  // Reset move timer for next player
  if (timers[from]) clearTimeout(timers[from]);
  timers[from] = setTimeout(() => {
    const dbReloaded = loadDB();
    if (dbReloaded[from] && !dbReloaded[from].finished) {
      const player1Mention = `@${dbReloaded[from].players[0].split("@")[0]}`;
      const player2Mention = `@${dbReloaded[from].players[1].split("@")[0]}`;
      conn.sendMessage(from, {
        text: `⌛️ *Game timed out!*\nNo move was made within 40 seconds.\nGame between ${player1Mention} and ${player2Mention} has been cancelled.`,
        mentions: dbReloaded[from].players
      });
      delete dbReloaded[from];
      saveDB(dbReloaded);
      delete timers[from];
    }
  }, 40 * 1000);

  saveDB(db);

  // Show updated game board and turn info
  const player1Mention = `@${game.players[0].split("@")[0]}`;
  const player2Mention = `@${game.players[1].split("@")[0]}`;
  await reply(gameMessage(game, player1Mention, player2Mention), null, { mentions: game.players });
});
