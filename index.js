#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const figlet = require('figlet');
const shell = require('shelljs');
const fs = require('fs');
const clear = require('clear');
const ora = require('ora');
const { getNextWord } = require('./query');

const { Command } = require('commander');
const program = new Command();
program.version('0.0.1');

const Freq = {
  SOON: 'SOON',
  LATER: 'LATER',
  NEVER: 'NEVER'
};

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
  const langs = { French: 'fra', Russian: 'rus' };
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

const run = async () => {
  if (!isInstalled()) {
    const langs = await setup();
  }

  presentWord();
};

const presentWord = async () => {
  clear();
  const now = new Date();
  const spinner = ora('Loading words...').start();

  await getNextWord({ lang: 'fra' }).then(async word => {
    spinner.stop();
    clear()
    const later = new Date();

    let data = word.word.toJSON();
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
    const frequency = await selectFrequency();

    if (frequency == Freq.SOON) {
      console.log('soon');
    } else if (frequency == Freq.LATER) {
    } else if (frequency == Freq.NEVER) {
    }
  });
};

run();
