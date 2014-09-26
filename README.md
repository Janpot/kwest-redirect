# kwest-text [![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url]

Redirect requests for [kwest](https://github.com/Janpot/kwest) module.

## Installation

    $ npm install --save kwest-redirect

## Use

```js
var redirect = require('kwest-redirect'),
    request  = redirect(require('kwest'));

request('http://www.example.com', { maxRedirects: 10 })
  .then(function (res) {
    // has followed all redirects
  });
```


[travis-url]: http://travis-ci.org/Janpot/kwest-text
[travis-image]: http://img.shields.io/travis/Janpot/kwest-text.svg?style=flat

[depstat-url]: https://david-dm.org/Janpot/kwest-text
[depstat-image]: http://img.shields.io/david/Janpot/kwest-text.svg?style=flat
