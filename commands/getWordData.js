const linguee = require('linguee');

const translate = (word, { type, from, to }) => {
  return linguee
    .translate(word, { from, to })
    .then(res => {
      if (res.words.length == 0) return false;
      let possible = res.words[0].translations.filter(t => t.examples.length > 0).slice(0, 3);

      if (possible.length == 0) return false;

      return possible.map(({ term, type, examples }) => ({
        term,
        type,
        examples
      }));
    })
    .catch(error => {
      console.log(error);
      return false;
    });
};

module.exports = translate;
