# kwest-redirect [![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url]

Redirect middleware for [kwest](https://github.com/Janpot/kwest) module.

## Installation

    $ npm install --save kwest-redirect

## Use

```js
var redirect = require('kwest-redirect'),
    base     = require('kwest-base'),
    request  = base.wrap(redirect({ maxRedirects: 10 }));

request('http://www.example.com')
  .then(function (res) {
    // has followed all redirects
  });
```


[travis-url]: http://travis-ci.org/Janpot/kwest-redirect
[travis-image]: http://img.shields.io/travis/Janpot/kwest-redirect.svg?style=flat

[depstat-url]: https://david-dm.org/Janpot/kwest-redirect
[depstat-image]: http://img.shields.io/david/Janpot/kwest-redirect.svg?style=flat
