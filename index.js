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

const rest = new REST({ version: '9' }).setToken(token);

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




// // Start the scan from the current directory
// scanDirectory(process.cwd()).then((commands) => {
//     console.log(`Loaded ${commands.length} commands.`);
// });

// const client = new Client({
//     intents: [GatewayIntentBits.Guilds]
// });

// client.once('ready', async () => {
//     let commands;
//     if (guildId) {
//         commands = await client.guilds.cache.get(guildId)?.commands.fetch();
//     } else {
//         commands = await client.application?.commands.fetch();
//     }

//     console.log('Commands:');
//     commands.forEach((command) => {
//         console.log(`Name: ${command.name}\nDescription: ${command.description}`);
//     });
// });

// client.login(token);  // Enter your bot token here


// // Construct and prepare an instance of the REST module
// const rest = new REST().setToken(token);

// // and deploy your commands!
// (async () => {
//     try {
//         console.log(`Started refreshing ${commands.length} application (/) commands.`);

//         console.log(commands);
//         // The put method is used to fully refresh all commands in the guild with the current set
//         const data = await rest.put(
//             Routes.applicationGuildCommands(clientId, guildId),
//             { body: commands },
//         );

//         console.log(`Successfully reloaded ${data.length} application (/) commands.`);
//     } catch (error) {
//         // And of course, make sure you catch and log any errors!
//         console.error(error);
//     }
// })();
