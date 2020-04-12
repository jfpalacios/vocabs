const fs = require('fs');
const readline = require('readline');
const glob = require('glob');
const path = require('path');
const db = require(`${__dirname}/../db`);

async function synchronize() {
  await db.sequelize.sync({ force: true });
  console.log('All models were synchronized successfully.');
}

async function populateWords() {
  ['fra'].forEach(lang => {
    const wordPath = `${__dirname}/../data/${lang}/words/*.txt`;
    glob(wordPath, null, async (err, files) => {
      for (let file of files) {
        const lines = fs.readFileSync(file).toString().split('\n');
        const words = uniqueWords(lines, lang, file);
        const existing = await getExistingWords(words, db);

        db.word.bulkCreate(words.filter(obj => !existing.has(obj.word)));
      }
    });
  });
}

function uniqueWords(lines, lang, file) {
  return lines.reduce(
    (acc, word) => {
      if (!acc[1][word]) {
        acc[0].push({
          word,
          lang,
          level: path.basename(file).split('.')[0],
        });
        acc[1][word] = true;
      }
      return acc;
    },
    [[], {}]
  )[0];
}

async function getExistingWords(words, db) {
  return new Set(
    await db.word
      .findAll({
        where: { word: words.map(w => w.word) },
        logging: false
      })
      .map(o => o.word)
  );
}

async function initDb() {
  await synchronize();
  await populateWords();
}

module.exports = initDb