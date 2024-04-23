#!/usr/bin/env node
import inquirer from 'inquirer';
import figlet from 'figlet';
import { spawn } from 'child_process';
import { readFile, writeFile, access, rm } from 'fs/promises';
import path from 'path';


async function displayAsciiArt(text) {
    return new Promise((resolve, reject) => {
        figlet(text, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

async function promptUser() {
    const answers = await inquirer.prompt([
        { name: 'projectName', message: 'Enter project name:' },
        { name: 'projectDescription', message: 'Enter project description:' },
        {
            name: 'projectPort',
            message: 'Port to run app on:',
            default: '1403',
            validate: input => {
                const port = parseInt(input);
                return port >= 0 && port <= 65535; // Validate port range
            }
        },
        {
            name: 'logRequests',
            type: 'confirm',
            message: 'Log all incoming requests?',
            default: true
        },
        {
            name: 'logExceptions',
            type: 'confirm',
            message: 'Log uncaught exceptions?',
            default: true
        },
        {
            name: 'useMongoDB',
            type: 'confirm',
            message: 'Want to use inbuilt MongoDB ?',
            default: false
        },
        {
            name: 'mongoDBUrl',
            message: 'Enter MongoDB connection URL:',
            when: answers => answers.useMongoDB // Only ask if useMongoDB is true
        }
    ]);

    return answers;
}

async function cloneRepository(repositoryUrl, destinationPath) {
    try {
        await access(destinationPath);
        throw new Error(`Destination path '${destinationPath}' already exists.`);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }

    return new Promise((resolve, reject) => {
        const cloneProcess = spawn('git', ['clone', repositoryUrl, destinationPath]);
        cloneProcess.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Git clone process exited with code ${code}`));
        });
        cloneProcess.on('error', (error) => {
            reject(error);
        });
    });
}

async function updatePackageJson(projectName) {
    const packageJsonPath = path.join(projectName, 'package.json');
    try {
        await access(packageJsonPath);
        const packageJsonData = await readFile(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(packageJsonData);
        packageJson.name = projectName;
        await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('\nUpdated package.json with project configuration.');
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `Error updating package.json:`, error);
    }
}
async function updateTejasConfig(projectName, projectPort, logRequests, logExceptions, useMongoDB, mongoDBUrl) {
    const tejasConfigPath = path.join(projectName, 'tejas.config.json');
    try {
        const tejasConfigData = await readFile(tejasConfigPath, 'utf8');
        const tejasConfig = JSON.parse(tejasConfigData);

        // Update common configurations
        tejasConfig.port = projectPort;
        tejasConfig.log = { http_requests: logRequests, exceptions: logExceptions };
        tejasConfig.dir = { targets: 'targets' }; // Add or modify additional fields as needed

        // Update MongoDB configuration if useMongoDB is true and mongoDBUrl is provided
        if (useMongoDB && mongoDBUrl) {
            tejasConfig.db = {
                type: 'mongodb',
                uri: mongoDBUrl
            };
        }

        await writeFile(tejasConfigPath, JSON.stringify(tejasConfig, null, 2));
        console.log('\nUpdated tejas.config.json with project configuration.');
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `Error updating tejas.config.json:`, error);
    }
}

async function setupProject() {
    console.log('Welcome to Project Setup\n');

    const projectDetails = await promptUser();

    console.log('\nInstalling Project using "Fly Tejas"...');
    const asciiArt = await displayAsciiArt('Fly Tejas');
    console.log('\x1b[36m%s\x1b[0m', asciiArt);

    const repositoryUrl = 'https://github.com/hirakchhatbar/tejas-skeleton';
    const destinationPath = projectDetails.projectName;

    try {
        console.log(`\'${projectDetails.projectName}' Preparing for takeoff... 🚀`);
        await cloneRepository(repositoryUrl, destinationPath);
        // Remove the .git directory (if it exists) after cloning
        const gitDirPath = path.join(destinationPath, '.git');
        await rm(gitDirPath, { recursive: true, force: true });

        console.log('\nProject take off...🚀');
        console.log(`
        \x1b[1mProject Details\x1b[0m
        - Name: '${projectDetails.projectName}'
        - Description: '${projectDetails.projectDescription}'
        - Port: '${projectDetails.projectPort}'
        - Log Incoming Requests: '${projectDetails.logRequests ? 'Yes' : 'No'}'
        - Log Uncaught Exceptions: '${projectDetails.logExceptions ? 'Yes' : 'No'}'
        ${projectDetails.useMongoDB ? `- MongoDB Connection URL: '${projectDetails.mongoDBUrl}'` : ''}
    `);
        await updatePackageJson(projectDetails.projectName);
        await updateTejasConfig(
            projectDetails.projectName,
            projectDetails.projectPort,
            projectDetails.logRequests,
            projectDetails.logExceptions,
            projectDetails.useMongoDB,
            projectDetails.mongoDBUrl
        );
        // Other setup tasks...
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', 'Error during project setup:', error);
    }
}

setupProject();
