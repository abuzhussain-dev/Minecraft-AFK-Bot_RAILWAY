// bot.js — Railway-ready, env vars only
const mineflayer = require('mineflayer');

const config = {
  serverHost: process.env.SERVER_HOST || 'localhost',
  serverPort: parseInt(process.env.SERVER_PORT || '25565'),
  botUsername: process.env.BOT_USERNAME || 'RailwayAFK',
  botChunk: parseInt(process.env.BOT_CHUNK || '1'),
  mcVersion: process.env.MC_VERSION || false
};

const bot = mineflayer.createBot({
  host: config.serverHost,
  port: config.serverPort,
  username: config.botUsername,
  auth: 'offline',
  version: config.mcVersion,
  viewDistance: 'tiny'
});

let movementPhase = 0;
const STEP_INTERVAL = 1500;
const JUMP_DURATION = 500;

bot.on('login', () => {
  console.log(`🔌 Logged in as ${bot.username}`);
});

bot.on('spawn', () => {
  console.log(`✅ ${config.botUsername} is Ready!`);

  setTimeout(() => {
    bot.setControlState('sneak', true);
  }, 3000);

  setTimeout(movementCycle, STEP_INTERVAL);
});

function movementCycle() {
  if (!bot.entity) return;

  switch (movementPhase) {
    case 0:
      bot.setControlState('forward', true);
      bot.setControlState('back', false);
      bot.setControlState('jump', false);
      break;
    case 1:
      bot.setControlState('forward', false);
      bot.setControlState('back', true);
      bot.setControlState('jump', false);
      break;
    case 2:
      bot.setControlState('forward', false);
      bot.setControlState('back', false);
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), JUMP_DURATION);
      break;
    case 3:
      bot.setControlState('forward', false);
      bot.setControlState('back', false);
      bot.setControlState('jump', false);
      break;
  }

  movementPhase = (movementPhase + 1) % 4;
  setTimeout(movementCycle, STEP_INTERVAL);
}

bot.on('kicked', (reason) => {
  console.log('❌ Kicked:', reason);
  process.exit(1);
});

bot.on('error', (err) => {
  console.error('⚠️ Error:', err.message);
  process.exit(1);
});

bot.on('end', () => {
  console.log('⛔️ Bot Disconnected! Exiting for Railway restart...');
  process.exit(1);
});
