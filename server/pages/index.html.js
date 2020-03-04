const h = require('../renderer/h');
const logo = require('./logo');

module.exports = function(component, { context, url, jsBundle }) {
  return h(
    h.fragment,
    null,
    h('!DOCTYPE', { html: true }),
    h(
      'html',
      { lang: 'en' },
      h(
        'head',
        null,
        h('meta', { charset: 'UTF-8' }),
        h('meta', {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1.0',
        }),
        h('meta', {
          name: 'description',
          content:
            'It takes 1,990 delegates to win the nomination for President in the DNC. These are the current counts for all participating candidates.',
        }),

        /* facebook meta */
        h('meta', {
          property: 'og:type',
          content: 'website',
        }),
        h('meta', {
          property: 'og:url',
          content: `https://1990to.win${url}`,
        }),
        h('meta', {
          property: 'og:site_name',
          content: '1990 to win',
        }),
        h('meta', { property: 'og:title', content: '1,990 to win' }),
        h('meta', {
          property: 'og:description',
          content:
            'It takes 1,990 delegates to win the nomination for President in the DNC. These are the current counts for all participating candidates.',
        }),
        h('meta', {
          property: 'og:image',
          content: `https://1990to.win/assets/images/logo.png`,
        }),

        /* twitter meta */
        h('meta', {
          name: 'twitter:card',
          content: 'summary_large_image',
        }),
        h('meta', {
          name: 'twitter:domain',
          value: '1990to.win',
        }),
        h('meta', {
          property: 'twitter:title',
          value: '1990 to win',
        }),
        h('meta', {
          property: 'twitter:description',
          value:
            'It takes 1,990 delegates to win the nomination for President in the DNC. These are the current counts for all participating candidates.',
        }),
        h('meta', {
          property: 'twitter:creator:id',
          value: '_tbremer',
        }),
        h('meta', {
          property: 'twitter:image',
          value: `https://1990to.win/assets/images/logo.png`,
        }),

        h('title', null, '1,990 to win'),
        h('link', { href: '/assets/style.css', rel: 'stylesheet' }),
        h('link', { href: '/assets/images/favicon.png', rel: 'icon' }),
        h('script', {
          src: `/assets/${jsBundle}`,
          type: 'text/javascript',
        })
      ),
      h(
        'body',
        null,
        h(
          'header',
          {
            style:
              'width: 100%; max-width: 468px; margin: 1rem auto 2rem; text-align: center;',
          },
          logo()
        ),
        h(
          'nav',
          {
            style: `text-align: center; margin: ${
              url === '/' ? '2rem' : '1rem'
            } 0;`,
          },
          h(
            'a',
            { href: url === '/' ? '/stats' : '/' },
            url === '/' ? '📈 Stats View' : '🏡 Home'
          )
        ),
        typeof component === 'function' ? component(context) : component
      )
    )
  );
};
