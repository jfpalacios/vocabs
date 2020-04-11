const RSSParser = require('rss-parser');
const rssParser = new RSSParser();
const glob = require('glob');
const fs = require('fs');

const parseArticle = require('./parseArticle');
const db = require(`${__dirname}/../db`);

function processFeeds() {
  ['fr'].forEach(lang => {
    const feedPath = `${__dirname}/../data/${lang}/rss/*.txt`;
    glob(feedPath, null, async (err, files) => {
      for (let file of files) {
        const feeds = fs.readFileSync(file).toString().split('\n');
        for(let url of feeds) {
          let feed = await rssParser.parseURL(url);
          updateExamples(feed, lang);
        }
      }
    });
  });
}
processFeeds();

async function updateExamples(feed, lang) {
  const words = new Set(await db.word.findAll().map(o => o.word));
  const examples = {};

  for (let item of feed.items) {
    let article = await parseArticle(item.link);
    article.content = separateHeaders(article.content);

    for (let word of words) {
      let found = getIndex(article.content, word);
      if (found === -1) continue;

      let sentence = expandFrom(article.content, found);
      if (!sentence) continue;

      if (!examples[word]) {
        examples[word] = [];
      }
      if (examples[word].length > 4) break;

      examples[word].push(sentence);
    }
  }

  Object.keys(examples).forEach(async word => {
    let wordObject = await db.word.findOne({ where: { word } });
    let total = Array.from(new Set([...examples[word], ...wordObject.examples]));
    shuffle(total);
    wordObject.examples = total.slice(0, 4);
    wordObject.save();
  });
}

function getIndex(content, word) {
  let source = content.toLowerCase();
  let found = source.indexOf(word.toLowerCase() + ' ');
  if (found == -1) {
    found = source.indexOf(word.toLowerCase() + '.');
  }
  return found;
}

function separateHeaders(content) {
  var regex = /(<([^>]+)>)/gi;
  return content.replace(regex, ' . ');
}

function expandFrom(content, index) {
  let l = index;
  let r = index;
  let len = content.length;
  while (true) {
    let distance = r - l;
    if (content[r] == '«') return null;
    if (content[l] == '»') return null;
    if (r < len && content[r] != '.' && content[r] != '»') r++;
    if (l >= 0 && content[l] != '.' && content[l] != '«') l--;
    if (r - l == distance) break;
  }

  if (content[l] == '«') l++;
  if (content[r] == '»') r--;

  return content.substring(++l, ++r).trim();
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
