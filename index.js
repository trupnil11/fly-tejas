#!/usr/bin/env node
import { program } from 'commander';
import * as readline from 'readline';
import figlet from 'figlet';
import { spawn } from 'child_process';
import { readFile, writeFile, access } from 'fs/promises';
import * as path from 'path';
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
            rl.question('modular structure ? (true/false): ', (answer) => {
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

async function cloneRepository(repositoryUrl, destinationPath) {
    return new Promise((resolve, reject) => {
        const currentDirectory = process.cwd();
        console.log(currentDirectory, "current working directory");
        const cloneProcess = spawn('git', ['clone', repositoryUrl, "."]);

        cloneProcess.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Git clone process exited with code ${code}`));
            }
        });

        cloneProcess.on('error', (error) => {
            reject(error);
        });
    });
}


async function updatePackageJson(projectName) {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    try {
        // Check if package.json file exists
        await access(packageJsonPath); // This will throw an error if the file does not exist
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `Error: package.json not found in ${projectName} directory.`);
        return;
    }
    try {
        // Read the existing package.json file
        const packageJsonData = await readFile(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(packageJsonData);
        // Update package.json fields based on user input
        packageJson.name = projectName;

        // Write the updated package.json back to the file
        await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('\nUpdated package.json with project configuration.');
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', 'Error updating package.json:', error);
    }
}

async function updateTejasConfig(projectPort, logRequests, logExceptions) {
    const tejasConfigPath = path.join(process.cwd(), 'tejas.config.json');
    try {
        // Read the existing tejas.config.json file
        const tejasConfigData = await readFile(tejasConfigPath, 'utf8');
        const tejasConfig = JSON.parse(tejasConfigData);

        // Update tejas.config.json fields
        tejasConfig.port = projectPort;
        tejasConfig.log = { http_requests: logRequests, exceptions: logExceptions };
        tejasConfig.dir = { targets: 'targets' }; // Add or modify additional fields as needed

        // Write the updated tejas.config.json back to the file
        await writeFile(tejasConfigPath, JSON.stringify(tejasConfig, null, 2));
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `Error updating tejas.config.json:`, error);
    }
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
    const repositoryUrl = 'https://github.com/hirakchhatbar/tejas-skeleton';
    const destinationPath = process.cwd();
    console.log(destinationPath);
    try {
        console.log(`\nCloning repository for ${projectName}...`);
        await cloneRepository(repositoryUrl, destinationPath);
        console.log('\nProject setup completed!');
        console.log(`
            \x1b[1mProject Details\x1b[0m
            - Name: '${projectName}'
            - Description: '${ProjectDescription}'
            - Port: '${ProjectPort}'
            - Database: '${databaseName}'
            - Log Incoming Requests: '${ForLogging ? 'Yes' : 'No'}'
            - Log Uncaught Exceptions: '${ForRequest ? 'Yes' : 'No'}'
            - Module Enabled: '${enableModule ? 'Yes' : 'No'}'
        `);
        await updatePackageJson(projectName);
        await updateTejasConfig(ProjectPort, ForLogging, ForRequest);

    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', 'Error during project setup:', error);
    }
}

tejasTakeOff();
