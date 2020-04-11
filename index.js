#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const figlet = require('figlet');
const shell = require('shelljs');
const fs = require('fs');
const RSSParser = require('rss-parser');
const { extract, setSanitizeHtmlOptions } = require('article-parser');
setSanitizeHtmlOptions({ allowedTags: ['code'], allowedAttributes: false });

const { Command } = require('commander');
const program = new Command();
program.version('0.0.1');

const isInstalled = () => {
  if (!fs.existsSync(`${__dirname}/.data.db`)) {
    console.log(
      chalk.green(
        figlet.textSync('Vocabs', {
          horizontalLayout: 'default',
          verticalLayout: 'default'
        })
      )
    );

    return false;
  }

  return true;
};

const setup = async () => {
  const langs = { French: 'fr' };
  const question = [
    {
      type: 'checkbox',
      name: 'langs',
      message: 'Which languages are you learning?',
      choices: Object.keys(langs),
      default: Object.keys(langs)[0]
    }
  ];

  return (await inquirer.prompt(question)).langs.map(val => langs[val]);
};

const run = async () => {
  if (!isInstalled()) {
    const langs = await setup();
    console.log(langs)
  }
};

run();
