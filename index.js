'use strict';

var util    = require('util'),
    urlUtil = require('fast-url-parser');

var DEFAULT_MAX_REDIRECTS = 10;

function RedirectError(message) {
  this.name = 'RedirectError';
  this.message = message;
}
RedirectError.prototype = new Error();
RedirectError.prototype.constructor = RedirectError;



function kwestRedirect(options) {
  options = options || {};
  options.maxRedirects = options.maxRedirects || DEFAULT_MAX_REDIRECTS;

  function isRedirect(request, response) {
    if (!options.followAll) {
      var method = request.method && request.method.toUpperCase();

      var isAllowedMethod = [
        'PATCH',
        'PUT',
        'POST',
        'DELETE'
      ].indexOf(method) < 0;

      if (!isAllowedMethod) {
        return false;
      }
    }

    return 300 <= response.statusCode && response.statusCode < 400;
  }

  return function (request, next) {
    var redirectsFollowed = 0;

    function followRedirects(response) {
      if (redirectsFollowed >= options.maxRedirects) {
        throw new RedirectError(util.format(
          'Exceeded maxRedirects. Probably stuck in a redirect loop: %s',
          request.uri.href
        ));
      }

      if (isRedirect(request, response)) {
        var location = response.headers && response.headers.location;

        if (!location) {
          throw new RedirectError(util.format(
            'Redirected without location header: %s',
            request.uri.href
          ));
        }

        var redirectUrl = urlUtil.resolve(request.uri.href, location);        
        request.uri = urlUtil.parse(redirectUrl);
        redirectsFollowed += 1;
        return next(request).then(followRedirects);
      }

      return response;
    }

    return next(request).then(followRedirects);
  };
}

kwestRedirect.RedirectError = RedirectError;
module.exports = kwestRedirect;
