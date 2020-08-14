const fs = require('fs-extra');
const log = require('./logger.js');
const discord = require('../app/functions_discord.js');
const basic = require('../app/functions_basic.js');
const { invoke, replies, exceptions } = require('../data/AI.json');
const { AI_percentChance, AI_percentChance_img } = require('../config/config.json');
const date = require('date-and-time');
require('date-and-time/plugin/ordinal');
date.plugin('ordinal');
var msgPost = true;

//description: 'start AI tasks'
module.exports.AIStart = function (message) {
    var now = date.format(new Date(), 'H'); // actual hour
    var message_array = message.content.toLowerCase().split(/ +/);
    var msg_part = basic.delEmpty([basic.deunicode(message_array[0]), basic.deunicode(message_array[1]), basic.deunicode(message_array[2]), basic.deunicode(message_array[3])]); // max first 4 words

    invoke.greetings.forEach(val => { //greetings
        var regx = new RegExp(`${val}`);
        if (regx.test(msg_part)) {
            switch (true) {
                case (now >= 0 && now <= 9): //morning
                    discord.replyMSG(message, basic.pickRandom(replies.greetings_morning));
                    break;
                case (now > 18 && now <= 23): //evening
                    discord.replyMSG(message, basic.pickRandom(replies.greetings_evening));
                    break;
                default: //generic
                    discord.replyMSG(message, basic.pickRandom(replies.greetings));
            }
            log.info(i18n.__("AI_reply_greetings", message.author.username.toString(), val, msg_part.join(" ")));
            return;
        }
    });

    invoke.goodnights.forEach(val => { //goodnights
        var regx = new RegExp(`${val}`);
        if (regx.test(msg_part)) {
            discord.replyMSG(message, basic.pickRandom(replies.goodnights));
            log.info(i18n.__("AI_reply_goodnights", message.author.username.toString(), val, msg_part.join(" ")));
            return;
        }
    });

    invoke.goodbyes.forEach(val => { //goodbyes
        var regx = new RegExp(`${val}`);
        if (regx.test(msg_part)) {
            discord.replyMSG(message, basic.pickRandom(replies.goodbyes));
            log.info(i18n.__("AI_reply_goodbyes", message.author.username.toString(), val, msg_part.join(" ")));
            return;
        }
    });

    /* RANDOM responses */
    if (global.images.length == 0) AI_percentChance_img = 0;
    if (global.txtResponses.length == 0) msgPost = false;
    if (basic.percentChance(AI_percentChance)) {
        if (basic.percentChance(AI_percentChance_img)) {
            //post image
            var img = basic.pickRandom(global.images);
            discord.replyMSG(message, null, {
                files: [{
                    attachment: img,
                    name: img.substring(img.lastIndexOf('/') + 1 | img.lastIndexOf('\\') + 1)
                }]
            });
            log.info(i18n.__("AI_Autoreply_img", message.author.username.toString()));
        } else if (msgPost) {
            //post message
            discord.replyMSG(message, basic.parse(basic.pickRandom(global.txtResponses), message.author.username.toString()));
            log.info(i18n.__("AI_Autoreply_msg", message.author.username.toString()));
        }
    }
};
