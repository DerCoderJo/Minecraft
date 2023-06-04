
# @bdsx/discord-link

### NOTE: This will only work on BDSX Server!


With this Plugin you can connect your Minecraft/Xbox Account with your Discord Account and you can sync the Minecraft Chat with an Discord Chat!

**Config:**
```json
{
    "guild_id": "", //Your Server ID
    "token": "", //Your Bot Token
    "discord_link": {
        "active": false,
        "change_discord_nickname": true //Should the Bot change the Nickname on the Discord Server
    },
    "chat_sync": {
        "active": false,
        "channel_id": "", //The Channel ID
        "format": "§r§8(§9Discord§8) §7{nickname} §8» §7{message}§r",
        "replace_in_name_with": { //Replace the Words in the Nickname
            "[Admin]": "§8[§4Admin§8]§7"
        }
    }
}
```