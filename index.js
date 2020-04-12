#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const figlet = require('figlet');
const shell = require('shelljs');
const fs = require('fs');
const clear = require('clear');
const ora = require('ora');
const sample = require('lodash/sample');

const { getNextWord } = require('./query');
const db = require('./db');

const { Command } = require('commander');
const program = new Command();
program.version('0.0.1');

const isInstalled = () => {
  if (!fs.existsSync(`${__dirname}/data/vocabs.db`)) {
    clear();
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
  const langs = { French: 'fra' };
  const question = [
    {
      type: 'checkbox',
      name: 'langs',
      message: 'Which languages are you learning?',
      choices: Object.keys(langs),
      default: [Object.keys(langs)[0]]
    }
  ];

  return (await inquirer.prompt(question)).langs.map(val => langs[val]);
};

const selectFrequency = async () => {
  const actions = { Soon: 'SOON', Later: 'LATER', Never: 'NEVER' };
  const question = [
    {
      type: 'list',
      name: 'action',
      message: 'When do you want to see this word again?',
      choices: Object.keys(actions)
    }
  ];

  return actions[(await inquirer.prompt(question)).action];
};

const confirmWord = async () => {
  const question = [
    {
      type: 'confirm',
      name: 'action',
      message: 'Do you still want to see this word?'
    }
  ];

  return await inquirer.prompt(question);
};

const run = async () => {
  let user = await db.user.findOne();
  if (!user || !isInstalled()) {
    const languages = await setup();
    user = await db.user.create({
      languages
    });
  }

  presentWord(user.id, sample(user.languages));
};

const presentWord = async (userId, lang) => {
  clear();
  const now = new Date();
  const spinner = ora('Loading words...').start();

  await getNextWord({ lang: lang }).then(async word => {
    spinner.stop();
    clear();
    const later = new Date();
    let data = word.toJSON().word;
    console.log();
    console.log(chalk.white.bold.bgBlack(data.word));
    console.log();
    data.results.forEach((result, index) => {
      console.log(chalk.white.bgBlack(`------ Term ${index + 1}: ${result.term} (${result.type}) ------`));
      result.examples.forEach(example => {
        console.log(` ${chalk.green.bgBlack(example.from)}`);
        console.log(` ${chalk.gray.bgBlack(example.to)}`);
        console.log();
      });
    });
    if (word.isNewWord()) {
      const frequency = await selectFrequency();
      word.markFrequency(frequency);
    } else {
      const shouldLearn = await confirmWord();
      word.markFrequency(shouldLearn ? word.Freq.SOON : word.Freq.NEVER);
    }
  });
};

run();
