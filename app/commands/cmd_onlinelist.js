/*global i18n*/
const date = require('date-and-time');
const ordinal = require('date-and-time/plugin/ordinal');
date.plugin(ordinal);
const log = require('../logger.js');
const animes = require('../../data/anime.json');
const basic = require('../functions_basic.js');
const discord = require('../functions_discord');
const calc = require('../functions_calculators.js');
const { selfDestructTime } = require('../../config/config.json');

var OrderedList = { "today": {}, "tomorrow": {}, "twoDays": {}, "three_to_sevenDays": {}, "later": {} };

module.exports = {
	name: 'onlinelist',
	altnames: i18n.__({ phrase: "__alt_cmd__onlinelist", locale: "custom" }),
	description: 'manualy initiate anime list update',
	execute(data) {
		for (var j = 0; j < Object.keys(animes).length; j++) {
			var i = Object.keys(animes)[j];
			var entryDate = date.parse(`${animes[`${i}`].year}-${calc.fixDubleDigits(animes[`${i}`].month)}-${calc.fixDubleDigits(animes[`${i}`].day)}`, 'YYYY-MM-DD');
			var newData = calc.NewRelease(entryDate, 7, parseInt(animes[`${i}`]._starting_episode) - parseInt(animes[`${i}`]._skipped_episodes), animes[`${i}`]._last_episode);
			var name = i;
			var dayDiff = parseInt(newData.differenceDAYS);
			var link = basic.parse(animes[`${i}`].link, newData.startEP);
			var newDate = newData.newDate;
			var ep = newData.startEP;
			var tmpDATA = { 'name': name, 'link': link, 'ep': ep, 'newDate': newDate, 'dayDiff': dayDiff };
			var ended = (ep > animes[`${i}`]._last_episode ? true : false);

			//sorting
			switch (true) {
				case (ended): //anime ended, do nothing
					break;
				case (dayDiff < 0): //anime ended, do nothing
					break;
				case (dayDiff == 0): //today
					OrderedList.today[name] = tmpDATA
					break;
				case (dayDiff == 1): //tomorrow
					OrderedList.tomorrow[name] = tmpDATA;
					break;
				case (dayDiff == 2): //twoDays
					OrderedList.twoDays[name] = tmpDATA;
					break;
				case (dayDiff > 2 && dayDiff <= 7): //three_to_sevenDays
					OrderedList.three_to_sevenDays[name] = tmpDATA;
					break;
				default: //later
					OrderedList.later[name] = tmpDATA;
			}
		}

		var ListMessage = "";
		var EntryString = (obj) => { return `**${obj.name}**: ${date.format(obj.newDate, 'dddd, DDD MMMM')} [\`ep${obj.ep}\`]\n`; };

		var combined = [OrderedList.today, OrderedList.tomorrow, OrderedList.twoDays, OrderedList.three_to_sevenDays];
		var titles = [i18n.__("today"), i18n.__("tomorrow"), i18n.__("two_days"), i18n.__("less_than_week")];
		combined.forEach(part => {
			if (!basic.isEmpty(part)) {
				ListMessage += "```fix\n" + titles[0] + ":```\n";
				titles.shift();
				for (var j = 0; j < Object.keys(part).length; j++) {
					var entry = Object.keys(part)[j];
					var obj = part[entry];
					ListMessage += EntryString(obj);
				}
				ListMessage += "\n";
			} else {
				titles.shift();
			}
		});

		if (!basic.isEmpty(OrderedList.later) && data.config.show_more_than_week) {
			ListMessage += "```fix\n" + i18n.__("later") + ":```\n";
			for (var k = 0; k < Object.keys(OrderedList.later).length; k++) {
				var entry = Object.keys(OrderedList.later)[k];
				var obj = OrderedList.later[entry];
				ListMessage += EntryString(obj);
			}
			ListMessage += "\n";
		}
		if (ListMessage == "") {
			ListMessage = i18n.__("cmd_onlinelist_msg_EMPTY");
		}
		discord.selfDestructReply(data.message, ListMessage, null, selfDestructTime);
		log.info(i18n.__("cmd_onlinelist_msg_log", data.message.author.username.toString()));
	},
};
