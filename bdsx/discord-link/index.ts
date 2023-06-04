import { MinecraftPacketIds } from "bdsx/bds/packetids"
import { ServerPlayer } from "bdsx/bds/player"
import { command } from "bdsx/command"
import { events } from "bdsx/event"
import { bedrockServer } from "bdsx/launcher"

import * as cp from "child_process"
import * as fs from "fs"
import * as path from "path"
import * as which from "which"

import * as config from "./config.json"


var proc: cp.ChildProcess

which("node", {}).then((path) => {
    proc = cp.fork(require.resolve("./src/botIndex.js"), {
        stdio: "inherit",
        execPath: path,
    })

    proc.on("message", (message) => {
        if(message.type == 1){
            let nickname = message.data.author.nickname
            for(let [r, w] of Object.entries(config.chat_sync.replace_in_name_with)) nickname = nickname.replace(r, w)
            bedrockServer.executeCommand(`tellraw @a {"rawtext": [{"text": "${config.chat_sync.format.replace("{nickname}", nickname).replace("{username}", message.data.author.username).replace("{message}", message.data.content)}"}]}`)
        }
    })
})
 

events.serverOpen.on(() => {
    if(!config.guild_id) throw new Error("You need to write a Guild ID in the Config!")
    if(!config.token) throw new Error("You need to write a Token in the Config!")

    if(config.discord_link.active) command.register("discord", "Link your Discord Account with your Minecraft Account").overload((params, origin, output) => {
        //@ts-ignore
        let codes: any = JSON.parse(fs.readFileSync(path.join(__dirname, "./src/codes.json")))


        let code = ``
        let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        for(let i = 0; i < 8; i++) code += characters.charAt(Math.floor(Math.random() * characters.length))

        codes[code] = {xuid: (origin.getEntity() as ServerPlayer).getXuid(), name: origin.getName()}
        fs.writeFileSync(path.join(__dirname, "./src/codes.json"), JSON.stringify(codes))

        //@ts-ignore
        origin.getEntity().runCommand(`tellraw @a {"rawtext": [{"text": "§r§8[§9Discord §5Link§8] §dRun on the Discord Server §l/link ${code}"}]}`)

        setTimeout(() => {
            //@ts-ignore
            let codes: any = JSON.parse(fs.readFileSync(path.join(__dirname, "./src/codes.json")))
            delete codes[code]
            fs.writeFileSync(path.join(__dirname, "./src/codes.json"), JSON.stringify(codes))
        }, 600000)
    }, {})
    
    fs.writeFileSync(path.join(__dirname, "./src/codes.json"), JSON.stringify({}))
})

events.packetBefore(MinecraftPacketIds.Text).on((packet, networkIdentifier) => {
    if(!config.chat_sync.active) return

    let player = bedrockServer.level.getPlayerByXuid(packet.xboxUserId)
    let message = {
        type: 0,
        data: {
            content: packet.message,
            author: {
                name: player?.getName(),
                nameTag: player?.getNameTag()
            }
        }
    }
    proc.send(message)
})

events.serverStop.on(() => {
    proc.kill()
})


export function getUserByXuid(xuid: String){
    //@ts-ignore
    let players: any = JSON.parse(fs.readFileSync(path.join(__dirname, "./players.json")))
    return players.find((user: String) => user == xuid)
}

export function getPlayerById(id: String){
    //@ts-ignore
    let players: any = JSON.parse(fs.readFileSync(path.join(__dirname, "./players.json")))
    //@ts-ignore
    return players[id]
}

export function addRoleToUser(userId: String, roleId: String){
    return proc.send({
        type: 2,
        data: {
            userId,
            roleId
        }
    })
}

export function removeRoleFromUser(userId: String, roleId: String){
    return proc.send({
        type: 3,
        data: {
            userId,
            roleId
        }
    })
}