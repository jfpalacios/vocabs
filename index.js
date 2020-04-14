#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const figlet = require('figlet');
const shell = require('shelljs');
const fs = require('fs');
const clear = require('clear');
const ora = require('ora');
const sample = require('lodash/sample');

const initDb = require('./commands/initDb');
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
  const langs = { French: 'fr', Russian: 'ru' };
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

const keypress = async () => {
  process.stdin.setRawMode(true);
  return new Promise(resolve =>
    process.stdin.once('data', () => {
      process.stdin.setRawMode(false);
      resolve();
    })
  );
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
  if (!isInstalled()) {
    await initDb();
  }

  let user = await db.user.findOne();
  if (!user) {
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
  console.log(chalk.white.bold.bgBlack('Loading Word...'));
  await getNextWord({ lang }).then(async word => {
    clear();
    let data = word.toJSON().word;
    if (!word.isNewWord()) {
      console.log(chalk.white.bold.bgBlack(data.word));
      console.log(chalk.grey.bgBlack('Press any key to view word...'));
      await keypress();
      clear();
    }

    console.log(chalk.white.bold.bgBlack(data.word));
    data.results.translations
      .filter(t => t.match >= 10)
      .forEach(term => {
        console.log(chalk.white.bgBlack(term.term) + ': ' + chalk.green('■'.repeat(Math.floor(term.match / 10))) + ' ');
      });
    console.log('-----------------------------');
    data.results.examples.forEach(example => {
      console.log();
      console.log(` ${chalk.green.bgBlack(example.from)}`);
      console.log(` ${chalk.gray.bgBlack(example.to)}`);
    });
    console.log();

    if (word.isNewWord()) {
      const frequency = await selectFrequency();
      word.markFrequency(frequency);
    } else {
      const shouldLearn = await confirmWord();
      word.markFrequency(shouldLearn ? 0 : 2);
    }
  });
};

run();
