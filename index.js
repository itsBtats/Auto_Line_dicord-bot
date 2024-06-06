const Discord = require("discord.js");
const {
  Client,
  Canvas,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  MessageSelectMenu,
  MessageReaction,
  ModalSubmitFieldsResolver,
  MessageFlags,
  MessageAttachment,
  ModalSubmitInteraction,
  MessageMentions,
  MessageManager,
  Message,
  MessageCollector,
  MessageComponentInteraction,
  MessageContextMenuInteraction,
  MessagePayload,
  Modal,
  Intents,
  Collection,
  MessageActionRowComponent,
  AutoModerationActionExecution,
  ApplicationCommand,
  CommandInteraction,
  TextInputComponent, InteractionCollector 
} = require("discord.js");
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.GUILD_WEBHOOKS,
    Intents.FLAGS.GUILD_INVITES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGE_TYPING,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.MESSAGE_CONTENT,
    Intents.FLAGS.DIRECT_MESSAGES,
    
  ],
  allowedMentions: { repliedUser: false },
});
const EventEmitter = require("events");
const myEmitter = new EventEmitter();
myEmitter.setMaxListeners(12099999);
client.setMaxListeners(1000); 
const { prefix,clientId,bot } = require("./config.json");

client.on("ready", () => {
  console.log(` ${client.user.tag} Working! 🟢`);
  let status = false;
  setInterval(function () {
    if (status === false) {
      client.user.setActivity("حط اي حاله ", { type: "WATCHING" });
      status = true;
    } else {
      client.user.setActivity(`${prefix}setupline`, { type: "WATCHING" });
      status = false;
    }
  }, 3000);
  client.user.setStatus("idle");
});

//====================================handle errors================================
process.on("unhandledRejection", (reason, promise) => {
  return;
});
process.on("uncaughtException", (err, origin) => {
  return;
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
  return;
});
process.on("multipleResolves", (type, promise, reason) => {
  return;
});
process.on("unhandledRejection", (reason, promise) => {
  console.error(
    "[ANTI-CRASH] An error has occured and been successfully handled: [unhandledRejection]"
      .red
  );
  return console.error(promise, reason);
});
process.on("uncaughtException", (err, origin) => {
  console.error(
    "[ANTI-CRASH] An error has occured and been successfully handled: [uncaughtException]"
      .red
  );
  return console.error(err, origin);
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
  console.error(
    "[ANTI-CRASH] An error has occured and been successfully handled: [uncaughtExceptionMonitor]"
      .red
  );
  return console.error(err, origin);
});
//========================================The code ================================\\

const maxLines = 5;
let lineSettings = {};
const lineSettingsPath = 'line.json';

if (fs.existsSync(lineSettingsPath)) {
  lineSettings = JSON.parse(fs.readFileSync(lineSettingsPath));
} else {
  fs.writeFileSync(lineSettingsPath, JSON.stringify(lineSettings, null, 2));
}

const lastMessageTimestamps = {};

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const guildId = message.guild.id;
  const guildSettings = lineSettings[guildId] || {};
  const channelId = message.channel.id;
  const currentTime = Date.now();

  
  if (!lastMessageTimestamps[channelId] || (currentTime - lastMessageTimestamps[channelId] > 1000)) {
    const channelSettings = guildSettings.channels ? guildSettings.channels[channelId] : null;

    if (channelSettings) {
      await message.channel.send(channelSettings.lineUrl);
      lastMessageTimestamps[channelId] = currentTime;
    }
  }
  
  if (message.content === `${prefix}setupline`) {
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('add_line')
          .setLabel('Add Line')
          .setStyle('PRIMARY')
          .setEmoji('➕'),
        new MessageButton()
          .setCustomId('remove_line')
          .setLabel('Remove Line')
          .setStyle('DANGER')
          .setEmoji('➖'),
        new MessageButton()
          .setCustomId('add_channel')
          .setLabel('Add Channel')
          .setStyle('PRIMARY')
          .setEmoji('📺'),
        new MessageButton()
          .setCustomId('remove_channel')
          .setLabel('Remove Channel')
          .setStyle('DANGER')
          .setEmoji('🚫'),
      );

    const channelList = Object.values(guildSettings.channels || {})
      .map(channel => channel ? `<#${channel.id}> - ${channel.lineName}` : '')
      .filter(channel => channel)
      .join('\n') || 'No line channel set.';

    const embed = new MessageEmbed()
      .setTitle('Line Settings')
      .setDescription('Click the button to setup the line settings:')
      .addField('Assigned Channels', channelList)
      .setImage(guildSettings.lineUrl || '')
      .setColor('#00FF00');

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
    let modal;
    if (interaction.customId === 'add_line') {
      modal = new Modal()
        .setCustomId('addLine')
        .setTitle('Add Line')
        .addComponents(
          new MessageActionRow().addComponents(
            new TextInputComponent()
              .setCustomId('lineUrl')
              .setLabel('Line URL')
              .setStyle('SHORT')
              .setRequired(true)
              .setPlaceholder('Enter the line URL')
          ),
          new MessageActionRow().addComponents(
            new TextInputComponent()
              .setCustomId('lineName')
              .setLabel('Line Name')
              .setStyle('SHORT')
              .setRequired(true)
              .setPlaceholder('Enter the line name')
          ),
          new MessageActionRow().addComponents(
            new TextInputComponent()
              .setCustomId('lineEmoji')
              .setLabel('Line Emoji')
              .setStyle('SHORT')
              .setPlaceholder('Enter the line emoji (optional)')
              .setRequired(false)
          ),
        );
    } else if (interaction.customId === 'remove_line') {
      const guildId = interaction.guild.id;
      const guildSettings = lineSettings[guildId] || {};
      const lineOptions = Object.keys(guildSettings.lines || {})
        .filter(key => guildSettings.lines[key])
        .map(key => ({
          label: guildSettings.lines[key].name,
          value: key,
          emoji: guildSettings.lines[key].emoji
        }));

      if (lineOptions.length === 0) {
        return await interaction.reply({ content: 'No lines to remove.', ephemeral: true });
      }

      const selectMenu = new MessageSelectMenu()
        .setCustomId('select_line_to_remove')
        .setPlaceholder('Select a line to remove')
        .addOptions(lineOptions);

      const row = new MessageActionRow().addComponents(selectMenu);

      return await interaction.reply({ content: 'Select a line to remove:', components: [row], ephemeral: true });
    } else if (interaction.customId === 'add_channel') {
      const guildId = interaction.guild.id;
      const guildChannels = lineSettings[guildId]?.channels || {};
      if (Object.keys(guildChannels).length >= maxLines) {
        return await interaction.reply({ content: 'You cannot add more than 5 lines.', ephemeral: true });
      }

      modal = new Modal()
        .setCustomId('addChannel')
        .setTitle('Add Channel')
        .addComponents(
          new MessageActionRow().addComponents(
            new TextInputComponent()
              .setCustomId('channelId')
              .setLabel('Channel ID')
              .setStyle('SHORT')
              .setRequired(true)
              .setPlaceholder('Enter the channel ID')
          ),
          new MessageActionRow().addComponents(
            new TextInputComponent()
              .setCustomId('channelName')
              .setLabel('Channel Name')
              .setStyle('SHORT')
              .setRequired(true)
              .setPlaceholder('Enter the channel name')
          ),
        );
    } else if (interaction.customId === 'remove_channel') {
      const guildId = interaction.guild.id;
      const guildChannels = lineSettings[guildId]?.channels || {};
      const channelOptions = Object.keys(guildChannels)
        .filter(key => guildChannels[key])
        .map(key => ({
          label: guildChannels[key].name,
          value: key,
        }));

      if (channelOptions.length === 0) {
        return await interaction.reply({ content: 'No channels to remove.', ephemeral: true });
      }

      const selectMenu = new MessageSelectMenu()
        .setCustomId('select_channel')
        .setPlaceholder('Select a channel to remove')
        .addOptions(channelOptions);

      const row = new MessageActionRow().addComponents(selectMenu);

      return await interaction.reply({ content: 'Select a channel to remove:', components: [row], ephemeral: true });
    }

    await interaction.showModal(modal);
  } else if (interaction.isModalSubmit()) {
    const guildId = interaction.guild.id;
    const guildSettings = lineSettings[guildId] || {};

    if (interaction.customId === 'addLine') {
      const lineUrl = interaction.fields.getTextInputValue('lineUrl');
      const lineName = interaction.fields.getTextInputValue('lineName');
      const lineEmoji = interaction.fields.getTextInputValue('lineEmoji');

      if (lineUrl && lineName) {
        guildSettings.lines = guildSettings.lines || {};
        guildSettings.lines[lineName] = {
          name: lineName,
          url: lineUrl,
          emoji: lineEmoji || "❌",
        };
        lineSettings[guildId] = guildSettings;
        fs.writeFileSync(lineSettingsPath, JSON.stringify(lineSettings, null, 2));
        await interaction.reply({ content: 'Line has been saved!', ephemeral: true });
      } else {
        await interaction.reply({ content: 'Line URL and name are required.', ephemeral: true });
      }
    } else if (interaction.customId === 'addChannel') {
      const channelId = interaction.fields.getTextInputValue('channelId');
      const channelName = interaction.fields.getTextInputValue('channelName');
      if (channelId && channelName) {
        if (Object.keys(guildSettings.channels || {}).length >= maxLines) {
          return await interaction.reply({ content: 'You cannot add more than 5 lines.', ephemeral: true });
        }

        const lineOptions = Object.keys(guildSettings.lines || {})
          .map(key => ({
            label: guildSettings.lines[key].name,
            value: key,
            description: `Use ${guildSettings.lines[key].name} in this channel`,
            emoji: guildSettings.lines[key].emoji,
          }));

        if (lineOptions.length === 0) {
          return await interaction.reply({ content: 'No lines available to assign.', ephemeral: true });
        }

        const selectMenu = new MessageSelectMenu()
          .setCustomId('select_line')
          .setPlaceholder('Select a line style')
          .addOptions(lineOptions);

        const row = new MessageActionRow().addComponents(selectMenu);

        guildSettings.tempChannel = { id: channelId, name: channelName };
        lineSettings[guildId] = guildSettings;
        fs.writeFileSync(lineSettingsPath, JSON.stringify(lineSettings, null, 2));

        return await interaction.reply({ content: 'Select a line style for this channel:', components: [row], ephemeral: true });
      } else {
        await interaction.reply({ content: 'Channel ID and name are required.', ephemeral: true });
      }
    }
  } else if (interaction.isSelectMenu()) {
    const guildId = interaction.guild.id;
    const guildSettings = lineSettings[guildId] || {};

    if (interaction.customId === 'select_channel') {
      const channelId = interaction.values[0];
      delete guildSettings.channels[channelId];
      lineSettings[guildId] = guildSettings;
      fs.writeFileSync(lineSettingsPath, JSON.stringify(lineSettings, null, 2));
      await interaction.reply({ content: 'Channel has been removed!', ephemeral: true });
    } else if (interaction.customId === 'select_line_to_remove') {
      const lineKey = interaction.values[0];
      delete guildSettings.lines[lineKey];
      lineSettings[guildId] = guildSettings;
      fs.writeFileSync(lineSettingsPath, JSON.stringify(lineSettings, null, 2));
      await interaction.reply({ content: 'Line has been removed!', ephemeral: true });
    } else if (interaction.customId === 'select_line') {
      const lineKey = interaction.values[0];
      if (guildSettings.tempChannel) {
        const { id: channelId, name: channelName } = guildSettings.tempChannel;
        guildSettings.channels = guildSettings.channels || {};
        guildSettings.channels[channelId] = {
          id: channelId,
          name: channelName,
          lineName: guildSettings.lines[lineKey].name,
          lineUrl: guildSettings.lines[lineKey].url,
        };
        delete guildSettings.tempChannel;
        lineSettings[guildId] = guildSettings;
        fs.writeFileSync(lineSettingsPath, JSON.stringify(lineSettings, null, 2));
        await interaction.reply({ content: `Channel ${channelName} has been assigned the line ${guildSettings.lines[lineKey].name}.`, ephemeral: true });
      }
    }
  }
});















//=====================================Bot_Login==================================


/**********************************************************
 * @INFO  [TABLE OF CONTENTS]
 
لو في ريبل ات حط التوكن في سيكرت  لو علي استضافه خارجيه ضيفو في ملف 
config.json


 *********************************************************/




client.login(process.env.token || bot).catch((err) => {
    console.log(`error: from Log in to bot token

\n
 error=---> ${err}`);
});


  
