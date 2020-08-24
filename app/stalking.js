const fs = require('fs-extra');
const log = require('./logger.js');
const discord = require('../app/functions_discord.js');
const basic = require('../app/functions_basic.js');
const { stalkingPosterChannelID } = require('../config/config.json');
const date = require('date-and-time');
const ordinal = require('date-and-time/plugin/ordinal');
date.plugin(ordinal);
var userStatus = {};

//description: 'start AI tasks'
module.exports.StalkingStart = function (oldPresence, newPresence) {
    async function getName() {
        var tmp = (oldPresence) ? oldPresence.userID : newPresence.userID; // use user ID from OLD if possible
        return client.users.fetch(tmp).then(user => {
            return user.username;
        });
    }
    getName().then(UserName => {
        if ((newPresence.activities).length < 1) {
            if (typeof (userStatus[UserName]) != 'undefined') {
                discord.sendMSGID(stalkingPosterChannelID, `${UserName} \`stoped\` ${userStatus[UserName].activitytype} => **${userStatus[UserName].activityname}**`);
                log.info(i18n.__("stalking_stop", UserName, userStatus[UserName].activitytype, userStatus[UserName].activityname));
                userStatus[UserName] = { "activitytype": null, "activityname": null };
            }
        } else {
            newPresence.activities.forEach(activity => {
                userStatus[UserName] = { "activitytype": activity.type, "activityname": activity.name };
                discord.sendMSGID(stalkingPosterChannelID, `${UserName} \`started\` ${userStatus[UserName].activitytype} => **${userStatus[UserName].activityname}**`);
                log.info(i18n.__("stalking_start", UserName, userStatus[UserName].activitytype, userStatus[UserName].activityname));
            });
        }
    });
};
