/**
 * auto space after post render : using [pangu](https://github.com/vinta/pangu.js)
 */

var pangu = require('pangu');

hexo.extend.filter.register('after_post_render', function(data) {
    data.title = pangu.spacing(data.title);
    data.content = pangu.spacing(data.content);
    
    /* for toc */
    data.excerpt = pangu.spacing(data.excerpt);
});
