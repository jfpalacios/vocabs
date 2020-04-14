const db = require('./db');
var sleep = require('sleep');
const getWordData = require('./commands/getWordData');
const Op = db.Sequelize.Op;
const date = require('date-and-time');

async function addWordsToQueue(limit, lang = 'fra') {
  const learning = await db.learning.findAll({ attributes: ['word_id'] });
  const filters = { limit, order: db.sequelize.random() };
  if (learning.length) {
    filters.where = {
      lang,
      [Op.not]: { id: learning.map(o => o.word_id) }
    };
  }
  const words = await db.word.findAll(filters);

  if (!words.length) throw new Error('ran out of words!!!');

  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    let results = await getWordData(word.word, { src: lang, trg: 'en' });
    if (results) {
      word.results = results;
      word.save();
    }

    if (i < words.length - 1) sleep.sleep(3);
  }

  await db.learning.bulkCreate(
    words.map(word => {
      return {
        word_id: word.id,
        stage: -1,
        active: !!word.results,
        due_date: new Date()
      };
    })
  );
}

async function getNextWord({ lang, prefetch = 1, examplesLength = 2 } = {}) {
  const words = await db.learning.findAll({
    where: {
      active: true,
      due_date: { [Op.lte]: date.format(new Date(), 'YYYY-MM-DD') }
    },
    include: [
      {
        model: db.word,
        required: true,
        where: { lang }
      }
    ]
  });
  

  if (words.length && words.length < prefetch) {
    addWordsToQueue(prefetch, lang);
  } else if (!words.length) {
    await addWordsToQueue(prefetch, lang);
    return await getNextWord({ lang, prefetch });
  }

  return words[0]
}

module.exports = {
  addWordsToQueue,
  getNextWord
};
