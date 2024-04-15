#!/usr/bin/env node
import { program } from 'commander';
import * as readline from 'readline';
import figlet from 'figlet';
//import execa from 'execa';

program
    .version('1.0.0')
    .option('-p, --project <name>', 'Specify project name')
    .option('-d, --database <name>', 'Specify database name')
    .option('-m, --module', 'Enable a specific module (true/false)')
    .parse(process.argv);
const validDatabases = ['mongodb', 'mysql'];

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

async function tejasTakeOff() {
    const projectName = await promptUserForProjectName();
    const databaseName = await promptUserForDatabaseName();
    const enableModule = await promptUserForModule();
    const asciiArt = await displayFigletText('Fly Tejas');
    console.log('\x1b[3m');
    console.log(asciiArt);
    console.log(`Creating project '${projectName}' with database '${databaseName}'( Module:'${enableModule}' )...`);

    //   try {
    //     // Create a directory
    //     await execa('mkdir', [projectName]);

    //     // Change directory and initialize a project
    //     await execa('npm', ['init', '-y'], { cwd: projectName });

    //     // Install dependencies
    //     await execa('npm', ['install', databaseName], { cwd: projectName });

    //     if (enableModule) {
    //       // Install a specific module
    //       await execa('npm', ['install', 'some-module'], { cwd: projectName });
    //     }

    //     console.log('Project setup completed!');
    //   } catch (error) {
    //     console.error('Error:', error);
    //   }
}

tejasTakeOff();
