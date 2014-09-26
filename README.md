# kwest-text

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
