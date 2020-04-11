const { extract, setSanitizeHtmlOptions } = require('article-parser');

setSanitizeHtmlOptions({
  allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  allowedAttributes: false
});

module.exports = extract;
