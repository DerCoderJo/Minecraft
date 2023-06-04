const fs = require("fs")
const path = require("path")
const Discord = require("discord.js")

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.DirectMessages,
        Discord.GatewayIntentBits.GuildModeration,
        Discord.GatewayIntentBits.GuildEmojisAndStickers,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.GuildVoiceStates,
        Discord.GatewayIntentBits.GuildWebhooks,
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildMessageReactions,
        Discord.GatewayIntentBits.DirectMessageReactions
    ],
    allowedMentions: {
        parse: [
            "users"
        ],
        repliedUser: true
    },
    presence: {
        status: "online",
        activities: [{type: Discord.ActivityType.Playing, name: "Discord Link"}]
    }
})

const config = require("../config.json")


client.on("ready", () => {
    console.log("[Discord-Link] Bot started")


    let guild = client.guilds.cache.get(config.guild_id)
    if(!guild) throw new Error("The Guild does not exists")

    guild.commands.create({
        name: "link",
        description: "Link your Discord Account with your Minecraft Account",
        options: [
            {
                name: "code",
                description: "The Code that you get if you type /discord in the Minecraft Chat",
                type: 3,
                required: true,
                max_length: 8
            }
        ]
    })
})

client.on("interactionCreate", (interaction) => {
    const codes = JSON.parse(fs.readFileSync(path.join(__dirname, "./codes.json")))
    const players = JSON.parse(fs.readFileSync(path.join(__dirname, "../players.json")))


    if(interaction.isCommand()){
        if(interaction.commandName == "link"){
            if(!codes[code]) return interaction.reply({content: "This Code does not exists!", ephemeral: true})

            let code = interaction.options.getString("code")
            players[interaction.user.id] = codes[code].xuid

            interaction.reply({content: `Your Discord Account is now linked with ${codes[code].name}`, ephemeral: true})
            if(config.discord_link.change_discord_nickname) interaction.member.setNickname(codes[code].name)

            delete codes[code]
        }
    }


    fs.writeFileSync(path.join(__dirname, "./codes.json"), JSON.stringify(codes))
    fs.writeFileSync(path.join(__dirname, "../players.json"), JSON.stringify(players))
})

client.on("messageCreate", (message) => {
    if(message.guildId !== config.guild_id || message.channelId !== config.chat_sync.channel_id || !config.chat_sync.active) return
    if((message.author.bot || !message.content) && message.author.id !== client.user.id) return message.react("❌")
    process.send({
        content: message.content,
        author: {
            username: message.author.username,
            tag: message.author.tag,
            nickname: message.member.nickname
        }
    })
})


process.on("message", (message) => {
    if(message.type == 0){
        let embed = new Discord.EmbedBuilder()
        .setAuthor({name: message.data.author.name})
        .setDescription(message.data.content)
        .setFooter({text: "Discord Link • Made by DerCoderJo"})
        .setTimestamp()
        .setColor("Aqua")

        return client.guilds.cache.get(config.guild_id).channels.cache.get(config.chat_sync.channel_id).send({embeds: [embed]})
    }else if(message.type == 2){
        let guild = client.guilds.cache.get(config.guild_id)
        return guild.members.fetch(message.data.userId).then((mem) => mem.roles.add(guild.roles.cache.get(message.data.roleId)))
    }else if(message.type == 3){
        let guild = client.guilds.cache.get(config.guild_id)
        return guild.members.fetch(message.data.userId).then((mem) => mem.roles.remove(guild.roles.cache.get(message.data.roleId)))
    }
})


client.login(config.token)