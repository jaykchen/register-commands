const { GatewayIntentBits, Client } = require('discord.js');
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const config = require('./config.json');
const path = require('path');

const { clientId, guildId, token } = config;

const commands = [];

function loadCommandsFromDirectory(directory) {
    const commandFiles = fs.readdirSync(directory);

    for (const file of commandFiles) {
        const filePath = path.join(directory, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            loadCommandsFromDirectory(filePath);
        } else if (stat.isFile() && file.endsWith('.js')) {
            const command = require(path.resolve(filePath));
            if (command.data && (command.execute || command.run)) {
                commands.push(command.data.toJSON());
            } else {
                console.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
}

loadCommandsFromDirectory('commands');

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();





const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    let commands;
    if (guildId) {
        commands = await client.guilds.cache.get(guildId)?.commands.fetch();
    } else {
        commands = await client.application?.commands.fetch();
    }

    console.log('Commands:');
    commands.forEach((command) => {
        console.log(`Name: ${command.name}\nDescription: ${command.description}`);
    });
});

client.login(token);  // Enter your bot token here


