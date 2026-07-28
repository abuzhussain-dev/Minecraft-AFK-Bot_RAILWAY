const mineflayer = require('mineflayer');
const crypto = require('crypto');

const config = {
  serverHost: process.env.SERVER_HOST || 'Ftwar.aternos.me',
  serverPort: parseInt(process.env.SERVER_PORT || '51549'),
  botUsername: process.env.BOT_USERNAME || 'RailwayAFK',
  botChunk: parseInt(process.env.BOT_CHUNK || '1'),
  mcVersion: process.env.MC_VERSION || false
};

// Deterministic "random" password derived from username
function generatePassword(username) {
  return crypto.createHash('sha256').update(username + '_afk_salt').digest('hex').slice(0, 12);
}

const password = generatePassword(config.botUsername);

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

  // Auto-register then auto-login
  setTimeout(() => {
    bot.chat(`/register ${password} ${password}`);
    console.log('📝 Sent /register');
  }, 1000);

  setTimeout(() => {
    bot.chat(`/login ${password}`);
    console.log('🔑 Sent /login');
  }, 3000);

  setTimeout(() => {
    bot.setControlState('sneak', true);
  }, 5000);

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
