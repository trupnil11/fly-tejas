#!/usr/bin/env node
import { program } from 'commander';
import * as readline from 'readline';
import figlet from 'figlet';

program
    .version('1.0.0')
    .option('-p, --project <name>', 'Specify project name')
    .option('-d, --database <name>', 'Specify database name (mongodb/mysql)')
    .option('-m, --module', 'Enable a specific module (true/false)')
    .option('-r, --log-requests <value>', 'Log incoming requests (yes/no)')
    .option('-e, --log-exceptions <value>', 'Log uncaught exceptions (yes/no)')
    .parse(process.argv);

const validDatabases = ['mongodb', 'mysql'];
const validYesValues = ['yes', 'y'];
const validNoValues = ['no', 'n'];

async function displayFigletText(text) {
    return new Promise((resolve, reject) => {
        figlet(text, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

async function promptUserForProjectName() {
    if (program.project) {
        return program.project;
    } else {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        return new Promise((resolve) => {
            rl.question('Enter project name: ', (answer) => {
                rl.close();
                resolve(answer);
            });
        });
    }
}
async function promptUserForProjectDescription() {
    if (program.project) {
        return program.project;
    } else {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        return new Promise((resolve) => {
            rl.question('Enter project Description: ', (answer) => {
                rl.close();
                resolve(answer);
            });
        });
    }
}
async function promptUserForProjectPort() {
    if (program.project) {
        return program.project;
    } else {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        return new Promise((resolve) => {
            rl.question('Enter project Port: ', (answer) => {
                rl.close();
                resolve(answer);
            });
        });
    }
}
async function promptUserForDatabaseName() {
    if (program.database && validDatabases.includes(program.database)) {
        return program.database;
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        console.log('Select database:');
        validDatabases.forEach((db, index) => {
            console.log(`${index + 1}. ${db}`);
        });

        rl.question('Enter database number: ', (answer) => {
            rl.close();
            const selectedDatabase = validDatabases[parseInt(answer) - 1];
            if (selectedDatabase && validDatabases.includes(selectedDatabase)) {
                resolve(selectedDatabase);
            } else {
                console.log('Invalid database selection. Please choose a valid option.');
                resolve(promptUserForDatabaseName());
            }
        });
    });
}


async function promptUserForModule() {
    if (program.module !== undefined) {
        return program.module;
    } else {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        return new Promise((resolve) => {
            rl.question('Enable a specific module? (true/false): ', (answer) => {
                rl.close();
                resolve(answer.toLowerCase() === 'true');
            });
        });
    }
}

async function promptUserForLogging(message) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(`${message} (yes/no): `, (answer) => {
            rl.close();
            const lowercaseAnswer = answer.trim().toLowerCase();
            if (validYesValues.includes(lowercaseAnswer)) {
                resolve(true);
            } else if (validNoValues.includes(lowercaseAnswer)) {
                resolve(false);
            } else {
                console.log('Invalid input. Please enter "yes" or "no".');
                resolve(promptUserForLogging(message));
            }
        });
    });
}

async function tejasTakeOff() {
    const projectName = await promptUserForProjectName();
    const ProjectDescription = await promptUserForProjectDescription();
    const ProjectPort = await promptUserForProjectPort();
    const databaseName = await promptUserForDatabaseName();
    const ForLogging = await promptUserForLogging('Log all incoming requests ?');
    const ForRequest = await promptUserForLogging('Log uncaught exceptions ?');
    const enableModule = await promptUserForModule();
    console.log('\nInstalling Project Using "Fly Tejas"...');
    const asciiArt = await displayFigletText('Fly Tejas');
    console.log('\x1b[36m%s\x1b[0m', asciiArt);

    console.log(`
      \x1b[1mProject Details\x1b[0m
      - Name: '${projectName}'
      - Description: '${ProjectDescription}'
      - Port: '${ProjectPort}'
      - Database: '${databaseName}'
      - Log Incoming Requests: '${ForRequest ? 'Yes' : 'No'}'
      - Log Uncaught Exceptions: '${ForLogging ? 'Yes' : 'No'}'
      - Module Enabled: '${enableModule ? 'Yes' : 'No'}'
    `);
}

tejasTakeOff();
