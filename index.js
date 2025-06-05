require("dotenv").config();

const { Client, GatewayIntentBits, Collection } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
} = require("@discordjs/voice");
const ytdl = require("@distube/ytdl-core");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const queues = new Map();

class Queue {
  constructor(guild) {
    this.guild = guild;
    this.tracks = [];
    this.connection = null;
    this.player = null;
    this.playing = false;
    this.current = null;
  }

  add(track) {
    this.tracks.push(track);
  }

  next() {
    return this.tracks.shift();
  }

  get length() {
    return this.tracks.length;
  }

  destroy() {
    this.tracks = [];
    this.current = null;
    this.playing = false;
    if (this.connection) {
      this.connection.destroy();
    }
  }
}

const isYouTube = (url) => {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/.test(url);
};

const getTrackInfo = async (url) => {
  try {
    const info = await ytdl.getInfo(url);
    return {
      title: info.videoDetails.title,
      url: url,
      duration: parseInt(info.videoDetails.lengthSeconds),
      requester: null,
    };
  } catch (err) {
    console.log("Не удалось получить инфо:", err.message);
    return null;
  }
};

const safeSend = async (channel, content) => {
  try {
    return await channel.send(content);
  } catch (error) {
    console.log("Ошибка отправки сообщения:", error.message);
    return null;
  }
};

const play = async (queue, channel) => {
  if (queue.length === 0) {
    await safeSend(channel, "Очередь закончилась, отключаюсь");
    queue.destroy();
    queues.delete(queue.guild);
    return;
  }

  const track = queue.next();
  queue.current = track;

  try {
    const stream = ytdl(track.url, {
      filter: "audioonly",
      quality: "highestaudio",
      highWaterMark: 1 << 25,
    });

    const resource = createAudioResource(stream);
    queue.player.play(resource);
    queue.playing = true;
  } catch (error) {
    console.log("Ошибка воспроизведения:", error.message);
    await safeSend(channel, "Что-то пошло не так с этим треком");
    play(queue, channel);
  }
};

client.once("ready", () => {
  console.log(`${client.user.username} онлайн!`);
  client.user.setPresence({
    activities: [{ name: "музыку", type: 2 }],
    status: "online",
  });
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot || !msg.content.startsWith("!")) return;

  const args = msg.content.slice(1).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  switch (cmd) {
    case "play":
    case "p": {
      const voiceChannel = msg.member?.voice?.channel;
      if (!voiceChannel) {
        return msg.reply("Зайди в голосовой канал");
      }

      const url = args[0];
      if (!url) {
        return msg.reply("Дай ссылку на ютуб!");
      }

      if (!isYouTube(url)) {
        return msg.reply("Только c ютуб!");
      }

      const trackInfo = await getTrackInfo(url);
      if (!trackInfo) {
        return msg.reply("Не смог загрузить это видео");
      }

      trackInfo.requester = msg.author.username;

      let queue = queues.get(msg.guild.id);

      if (!queue) {
        queue = new Queue(msg.guild.id);
        queues.set(msg.guild.id, queue);

        try {
          const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: msg.guild.id,
            adapterCreator: msg.guild.voiceAdapterCreator,
          });

          queue.connection = connection;
          queue.player = createAudioPlayer();
          connection.subscribe(queue.player);

          queue.player.on(AudioPlayerStatus.Idle, () => {
            queue.playing = false;
            play(queue, msg.channel);
          });

          queue.player.on("error", (err) => {
            console.log("Player error:", err);
            safeSend(msg.channel, "Ошибка плеера");
          });

          connection.on(VoiceConnectionStatus.Disconnected, () => {
            queues.delete(msg.guild.id);
          });
        } catch (err) {
          console.log("Connection error:", err);
          return msg.reply("Не могу подключиться к каналу");
        }
      }

      queue.add(trackInfo);

      if (queue.length === 1 && !queue.playing) {
        msg.reply(`Запускаю **${trackInfo.title}**`);
        play(queue, msg.channel);
      } else {
        msg.reply(
          `Добавил в очередь: **${trackInfo.title}** (номер ${queue.length})`
        );
      }
      break;
    }

    case "skip":
    case "s": {
      const queue = queues.get(msg.guild.id);
      if (!queue?.playing) {
        return msg.reply("Ничего не играет");
      }
      queue.player.stop();
      msg.reply("Пропустил");
      break;
    }

    case "stop": {
      const queue = queues.get(msg.guild.id);
      if (!queue) {
        return msg.reply("Ничего не играет");
      }
      queue.destroy();
      queues.delete(msg.guild.id);
      msg.reply("Остановил и очистил очередь");
      break;
    }

    case "queue":
    case "q": {
      const queue = queues.get(msg.guild.id);
      if (!queue || (queue.length === 0 && !queue.current)) {
        return msg.reply("Очередь пуста");
      }

      let response = "";
      if (queue.current) {
        response += `**Сейчас:** ${queue.current.title}\n\n`;
      }

      if (queue.length > 0) {
        response += "**Очередь:**\n";
        const tracks = queue.tracks.slice(0, 10);
        tracks.forEach((track, i) => {
          response += `${i + 1}. ${track.title}\n`;
        });

        if (queue.length > 10) {
          response += `\n...и еще ${queue.length - 10} треков`;
        }
      }

      msg.reply(response);
      break;
    }

    case "help":
    case "h": {
      const canEmbed = msg.channel
        .permissionsFor(msg.guild.members.me)
        ?.has("EmbedLinks");

      if (canEmbed) {
        const embed = {
          color: 0x0099ff,
          title: "Команды бота",
          fields: [
            {
              name: "Воспроизведение",
              value: "`!play <ссылка>` - добавить трек",
              inline: true,
            },
            {
              name: "Управление",
              value:
                "`!skip` - пропустить\n`!stop` - остановить\n`!queue` - показать очередь",
              inline: true,
            },
          ],
          footer: {
            text: "Работает только с YouTube",
          },
        };
        msg.reply({ embeds: [embed] });
      } else {
        const helpText = `**Команды бота:**

**Воспроизведение:**
\`!play <ссылка>\` - добавить трек
\`!p <ссылка>\` -    добавить трек

**Управление:**
\`!skip\` -  пропустить
\`!s\` -     пропустить

\`!stop\` -  остановить

\`!queue\` - показать очередь
\`!q\` -     показать очередь

Работает только с YouTube`;
        msg.reply(helpText);
      }
      break;
    }
  }
});

client.on("error", console.error);
process.on("unhandledRejection", (err) => {
  console.error("Unhandled promise rejection:", err);
});

if (!process.env.DISCORD_TOKEN) {
  console.error(" Нет токена в .env файле!");
  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN).catch(console.error);
