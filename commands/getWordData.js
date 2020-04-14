const axios = require('axios');

const translate = (word, { src, trg }) => {
  const payload = {
    source_text: word,
    target_text: '',
    source_lang: src,
    target_lang: trg,
    npage: 1,
    mode: 0
  };

  return axios
    .post('https://context.reverso.net/bst-query-service', payload)
    .then(res => {
      const data = {
        translations: res.data.dictionary_entry_list
          .filter(entry => entry.isTranslation)
          .map(entry => {
            return {
              match: (entry.frequency / res.data.nrows) * 100,
              term: entry.term
            };
          })
          .sort((a, b) => b.match - a.match)
          .slice(0, 3),
        examples: res.data.list.slice(0, 5).map(example => {
          return {
            from: example.s_text.replace(/<[^>]*>/g, ""),
            to: example.t_text.replace(/<[^>]*>/g, "")
          };
        })
      };

      if (!data.translations.length || !data.examples.length) return false;
      return data;
    })
    .catch(error => {
      console.log(error);
      return false;
    });
};

module.exports = translate;
