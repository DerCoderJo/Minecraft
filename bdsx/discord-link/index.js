"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeRoleFromUser = exports.addRoleToUser = exports.getPlayerById = exports.getUserByXuid = void 0;
const packetids_1 = require("bdsx/bds/packetids");
const command_1 = require("bdsx/command");
const event_1 = require("bdsx/event");
const launcher_1 = require("bdsx/launcher");
const cp = require("child_process");
const fs = require("fs");
const path = require("path");
const which = require("which");
const config = require("./config.json");
var proc;
which("node", {}).then((path) => {
    proc = cp.fork(require.resolve("./src/botIndex.js"), {
        stdio: "inherit",
        execPath: path,
    });
    proc.on("message", (message) => {
        if (message.type == 1) {
            let nickname = message.data.author.nickname;
            for (let [r, w] of Object.entries(config.chat_sync.replace_in_name_with))
                nickname = nickname.replace(r, w);
            launcher_1.bedrockServer.executeCommand(`tellraw @a {"rawtext": [{"text": "${config.chat_sync.format.replace("{nickname}", nickname).replace("{username}", message.data.author.username).replace("{message}", message.data.content)}"}]}`);
        }
    });
});
event_1.events.serverOpen.on(() => {
    if (!config.guild_id)
        throw new Error("You need to write a Guild ID in the Config!");
    if (!config.token)
        throw new Error("You need to write a Token in the Config!");
    if (config.discord_link.active)
        command_1.command.register("discord", "Link your Discord Account with your Minecraft Account").overload((params, origin, output) => {
            //@ts-ignore
            let codes = JSON.parse(fs.readFileSync(path.join(__dirname, "./src/codes.json")));
            let code = ``;
            let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (let i = 0; i < 8; i++)
                code += characters.charAt(Math.floor(Math.random() * characters.length));
            codes[code] = { xuid: origin.getEntity().getXuid(), name: origin.getName() };
            fs.writeFileSync(path.join(__dirname, "./src/codes.json"), JSON.stringify(codes));
            //@ts-ignore
            origin.getEntity().runCommand(`tellraw @a {"rawtext": [{"text": "§r§8[§9Discord §5Link§8] §dRun on the Discord Server §l/link ${code}"}]}`);
            setTimeout(() => {
                //@ts-ignore
                let codes = JSON.parse(fs.readFileSync(path.join(__dirname, "./src/codes.json")));
                delete codes[code];
                fs.writeFileSync(path.join(__dirname, "./src/codes.json"), JSON.stringify(codes));
            }, 600000);
        }, {});
    fs.writeFileSync(path.join(__dirname, "./src/codes.json"), JSON.stringify({}));
});
event_1.events.packetBefore(packetids_1.MinecraftPacketIds.Text).on((packet, networkIdentifier) => {
    if (!config.chat_sync.active)
        return;
    let player = launcher_1.bedrockServer.level.getPlayerByXuid(packet.xboxUserId);
    let message = {
        type: 0,
        data: {
            content: packet.message,
            author: {
                name: player === null || player === void 0 ? void 0 : player.getName(),
                nameTag: player === null || player === void 0 ? void 0 : player.getNameTag()
            }
        }
    };
    proc.send(message);
});
event_1.events.serverStop.on(() => {
    proc.kill();
});
function getUserByXuid(xuid) {
    //@ts-ignore
    let players = JSON.parse(fs.readFileSync(path.join(__dirname, "./players.json")));
    return players.find((user) => user == xuid);
}
exports.getUserByXuid = getUserByXuid;
function getPlayerById(id) {
    //@ts-ignore
    let players = JSON.parse(fs.readFileSync(path.join(__dirname, "./players.json")));
    //@ts-ignore
    return players[id];
}
exports.getPlayerById = getPlayerById;
function addRoleToUser(userId, roleId) {
    return proc.send({
        type: 2,
        data: {
            userId,
            roleId
        }
    });
}
exports.addRoleToUser = addRoleToUser;
function removeRoleFromUser(userId, roleId) {
    return proc.send({
        type: 3,
        data: {
            userId,
            roleId
        }
    });
}
exports.removeRoleFromUser = removeRoleFromUser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxrREFBdUQ7QUFFdkQsMENBQXNDO0FBQ3RDLHNDQUFtQztBQUNuQyw0Q0FBNkM7QUFFN0Msb0NBQW1DO0FBQ25DLHlCQUF3QjtBQUN4Qiw2QkFBNEI7QUFDNUIsK0JBQThCO0FBRTlCLHdDQUF1QztBQUd2QyxJQUFJLElBQXFCLENBQUE7QUFFekIsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtJQUM1QixJQUFJLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLEVBQUU7UUFDakQsS0FBSyxFQUFFLFNBQVM7UUFDaEIsUUFBUSxFQUFFLElBQUk7S0FDakIsQ0FBQyxDQUFBO0lBRUYsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRTtRQUMzQixJQUFHLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFDO1lBQ2pCLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQTtZQUMzQyxLQUFJLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDO2dCQUFFLFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtZQUMxRyx3QkFBYSxDQUFDLGNBQWMsQ0FBQyxxQ0FBcUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFD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