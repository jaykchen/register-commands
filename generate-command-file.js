const prompt = require('prompt');
const fs = require('fs');

prompt.start();

console.log('Please provide the following details for the new Discord Slash command.');

const schema = {
    properties: {
        CommandName: {
            description: 'Command name',
            required: true
        },
        CommandDescription: {
            description: 'Command description',
            required: true
        },
        ReplyContent: {
            description: 'Reply content',
            required: true
        },
        AddBusinessLogic: {
            description: 'Are you going to add more business logic to the command file? (yes/no)',
            pattern: /^(yes|no|y|n)$/i,
            message: 'Answer must be "yes" or "no"',
            required: true
        }
    }
};

prompt.get(schema, function (err, result) {
    if (err) {
        console.log(err);
        return;
    }

    let commandTemplate;
    if (result.AddBusinessLogic.toLowerCase() === 'no' || !result.AddBusinessLogic) {
        commandTemplate = `
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('${result.CommandName}')
        .setDescription('${result.CommandDescription}'),
    async execute(interaction) {
        return interaction.reply('${result.ReplyContent}');
    },
};
`;
    } else if (result.AddBusinessLogic.toLowerCase() === 'yes') {
        commandTemplate = `
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('${result.CommandName}')
        .setDescription('${result.CommandDescription}'),
    async execute(interaction) {
        // TODO: Implement the logic for complex command
        return interaction.reply('${result.ReplyContent}');
    },
};
`;
    }

    // Write the command to a new file
    fs.writeFile(`${result.CommandName}.js`, commandTemplate, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('New Discord Slash command created successfully!');
        }
    });
});
