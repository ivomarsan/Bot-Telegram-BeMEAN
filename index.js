'use strict';
//const fun = require('funcy');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.API_TOKEN || 'INSERT API_TOKEN';
const username = process.env.USERNAME || '@bemean_oficialbot';
// Setup polling way
const bot = new TelegramBot(token, {polling: true});

const commands = require('./modules/commands');
const services = require('./modules/services');
const security = require('./modules/security');
const monitutils = require('./modules/utils/monitutils');

monitutils.notifySharedAccount(bot, "*Bot " + username + " reiniciado.*");

// Matches commands
bot.onText(/^\/([a-zA-Z]+) ?([^@]+)?(@.*)?/i, (msg, match) => {
  if ((match[3] && match[3] == username) || !match[3]) {
    let command = match[1];
    if (command) {
      if (command in commands) {
        command = commands[command];
        let argsCount = match.length - 2;
        if (argsCount >= command.numParams) {
          command.execute(msg, match, bot);
        } else {
          bot.sendMessage(msg.chat.id, "Ops, número incorreto de parâmetros fornecidos (" + argsCount + "). Número de parâmetros exigidos: " + command.numParams + " :/");
        }
      } else {
        if (match[3]) bot.sendMessage(msg.chat.id, "Eita, esse comando não existe :/");
      }
    }
  }
});

// command1@BeMEANoficial_bot
bot.onText(/^\/command1@BeMEANoficial_bot/i, (msg) => {
  bot.sendMessage(msg.chat.id, 'ESSE COMANDO NAO EXISTE PORRAA!!!!');
});

bot.onText(/^([^\/]+)/i, (msg, match) => {

  const _services = [
    {
      member: 'reduce',
      regex: /\.reduce/,
      fn: (bot, msg, match) => services.evalReduce.execute(bot, msg),
      eval: true
    },
    {
      member: 'map',
      regex: /\.map/,
      fn: (bot, msg, match) => services.evalMap.execute(bot, msg),
      eval: true
      // fn: (bot, msg, match) => bot.sendMessage(msg.chat.id, 'Resposta do map: ' + eval(msg.text))
    },
    {
      member: 'filter',
      regex: /\.filter/,
      fn: (bot, msg, match) => services.evalFilter.execute(bot, msg),
      eval: true
      // fn: (bot, msg, match) => bot.sendMessage(msg.chat.id, 'Resposta do filter: ' + eval(msg.text))
    },
    {
      member: 'test',
      regex: /^regex/i,
      fn: (bot, msg, match) => services.evalTest.execute(bot, msg),
      eval: true
      // fn: (bot, msg, match) => bot.sendMessage(msg.chat.id, 'Resposta do test: ' + eval(msg.text))
    },
    {
      member: 'date',
      regex: /Date\.|new Date/,
      fn: (bot, msg, match) => services.evalDate.execute(bot, msg),
      eval: true
      // fn: (bot, msg, match) => bot.sendMessage(msg.chat.id, 'Resposta do Date: ' + eval(msg.text))
    },
    {
      member: 'md5',
      regex: /^md5\s+([a-zA-Z])+/i,
      fn: (bot, msg, match) => services.md5.execute(bot, msg, match),
      eval: false
    },
    {
      member: 'gmaps',
      regex: /onde\s+(fica|está|é|eh)\s*(o|a)?\s+(.+)$/i,
      fn: (bot, msg, match) => services.gmaps.execute(bot, msg, match),
      eval: false
    },
    {
      member: 'mdn',
      regex: /^js\s+([a-zA-Z])+/i,
      fn: (bot, msg, match) => services.mdn.execute(bot, msg, match),
      eval: false
    },
    {
      member: 'npm',
      regex: /^npm\s+([a-zA-Z])+/i,
      fn: (bot, msg, match) => services.npm.execute(bot, msg, match),
      eval: false
    },
    {
      member: 'wikipedia',
      regex: /^(Quem|O que|O q|oq) (é|eh|eah|e|significa) ([^?]*)\s?\??/i,
      fn: (bot, msg, match) => services.wikipedia.execute(bot, msg, {'wh': match[1], 'query': match[3]}),
      eval: false
    },
    {
      member: 'math',
      regex: /(Math\.)|\(?-?[.0-9]+(\s*[-+\/*]\s*-?[0-9Math]+)+(\)|\b|)/i,
      fn: (bot, msg, match) => services.math.execute(bot, msg),
      eval: true
    },
    {
      member: 'maconha',
      regex: /(420)|maconha|weed|marijuana|erva|bagulho|manhuca/i,
      fn: (bot, msg, match) => services.maconha.execute(bot, msg),
      eval: false
    },
    {
      member: 'risada',
      regex: /lol|kkkk|huehue|h+a+h+a+|h+e+h+e+|h+i+h+i+|h+u+a+s+|j+e+j+e+|h+u+a+h+u+a|h+u+e+h+u+e/i,
      fn: (bot, msg, match) => services.risada.execute(bot, msg),
      eval: false
    },
    {
      member: 'saudacao',
      regex: /b(oa|om) (dia|tarde|noite)/i,
      fn: (bot, msg, match) => services.saudacao.execute(bot, msg, match),
      eval: false
    },
    {
      member: 'tuamae',
      regex: /bot.*(burro|idiota|retardado|trou?xa|maconheiro|inútil|doido|fiduma(e|é)gua|z(e|é) r(u|o)ela|ot(á|a)rio|v(i|e)ado)/i,
      fn: (bot, msg, match) => services.tuamae.execute(bot, msg, match),
      eval: false
    },
    {
      member: 'lmgtfy',
      regex: /^gme\s+([a-zA-Z ])+/i,
      fn: (bot, msg, match) => services.gme.execute(bot, msg, match),
      eval: false
    },
    {
      member: 'sticker-happy',
      regex: /(:D|😁)/,
      fn: (bot, msg) => services.stickerHappy.execute(bot, msg, match),
      eval: false
    },
    {
      member: 'sticker-heart',
      regex: /❤️|<3|S2(?:[^\d]+|$)/i,
      fn: (bot, msg) => services.stickerHeart.execute(bot, msg, match),
      eval: false
    },
    {
      member: 'sticker-webschool',
      regex: /webschool/i,
      fn: (bot, msg, match) => services.stickerWebschool.execute(bot, msg, match),
      eval: false
    },
    {
      member: 'sticker-bemean',
      regex: /bemean|be\s*mean/i,
      fn: (bot, msg, match) => services.stickerBemean.execute(bot, msg),
      eval: false
    },
    {
      member: 'omdb',
      regex: /bot, (?:v?o?c?[e|ê]?)? *(?:j[a|á])? *(?:viu|assist[iu|e]|gost[a|ou]|conhece) *(?:de )? *([^?]+)/i,
      fn: (bot, msg, match) => services.omdb.execute(bot, msg, match),
      eval: false
    }
  ];

  const _load = (match) => {
    if (Array.isArray(match)) {
      let recognized = false;
      _services.forEach((element, index) => {
        if (_services[index].regex.test(msg.text)) {
          recognized = true;
          var _match = msg.text.match(_services[index].regex);
          const service = _services[index];
          if (security.isSecure(msg, service.eval)) {
            service.fn(bot, msg, _match);
          } else {
            monitutils.notifyBlacklistedEval(msg, bot);
          }
        }
      });
      if (!recognized && msg.chat.type == 'private') {
        services.masem.execute(bot, msg);
      }
    }
  };

  _load(match);
});

bot.on('sticker', (msg) => {
  let ids = require('./modules/utils/monitutils').adminIds;
  if (msg.chat.type == 'private' && ids.indexOf(msg.chat.id) >= 0) {
    bot.sendMessage(msg.chat.id, msg.sticker.file_id, {'reply_to_message_id': msg.message_id});
  }
});

// Pares
/*bot.onText(/^par/i, (msg, match) => {
 const _arr = msg.text.split('par ')[1]
 const arr = JSON.parse(_arr);
 const _return = arr.filter((acc) => !(acc % 2));
 bot.sendMessage(msg.chat.id, 'Par(es): ' + _return);
 });*/

// Ímpares
/*bot.onText(/^impar/i, (msg, match) => {
 const _arr = msg.text.split('par ')[1]
 const arr = JSON.parse(_arr);
 const _return = arr.filter((acc) => (acc % 2));
 bot.sendMessage(msg.chat.id, 'Ímpar(es): ' + _return);
 });*/


// bot.onText(/^md5\s+([a-zA-Z])+/i, (msg, match) => {
//   services.md5.execute(bot, msg, match)
// });
// GMaps
// bot.onText(/onde\s+(fica|está|é|eh)\s*(o|a)?\s+(.+)$/i, (msg, match) => {
//   services.gmaps.execute(bot, msg, match);
// });

// Github
// bot.onText(/(gh|github|repo|repository|repositório|repositorio) ([^?]*)\??/i, (msg, match)  => {
//   services.wikipedia.execute(bot, msg, { 'wh': match[1], 'query': match[3] });
// });

// MDN
// bot.onText(/^js\s+([a-zA-Z])+/i, (msg, match) => {
//   services.mdn.execute(bot, msg, match);
// });

// Wikipedia
/*bot.onText(/(Quem|O que|O q|oq) (é|eh|eah|e|significa) ([^? ]*) ?\??/i, (msg, match) => {
 services.wikipedia.execute(bot, msg, { 'wh': match[1], 'query': match[3] });
 });

 // calcular
 bot.onText(/(Math\.)|\(?-?[.0-9]+(\s*[-+\/*]\s*-?[0-9Math]+)+(\)|\b|)/i, (msg, match) => {
 services.math.execute(bot, msg);
 });

 bot.onText(/(420)|maconha|weed|marijuana|erva|bagulho/i, (msg, match) => {
 services.maconha.execute(bot, msg);
 });

 // risada
 bot.onText(/lol|kkkk|huehue|h+a+h+a+|h+e+h+e+|h+i+h+i+|h+u+a+s+|j+e+j+e+|h+u+a+h+u+a|h+u+e+h+u+e/i, (msg, match) => {
 services.risada.execute(bot, msg);
 });

 // saudação
 bot.onText(/b(oa|om) (dia|tarde|noite)/i, (msg, match) => {
 services.saudacao.execute(bot, msg, match);
 });*/

