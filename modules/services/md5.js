'use strict';

const url = require('url');
const md5 = require('md5');

const execute = (bot, msg, match) => {
  bot.sendMessage(msg.chat.id, md5(msg));
}
module.exports = {
    execute: execute
}