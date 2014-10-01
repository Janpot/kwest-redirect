'use strict';

var util     = require('util'),
    defaults = require('merge-defaults'),
    urlUtil  = require('fast-url-parser');


var DEFAULT_MAX_REDIRECTS = 10;

function RedirectError(message) {
  this.name = 'RedirectError';
  this.message = message;
}
RedirectError.prototype = new Error();
RedirectError.prototype.constructor = RedirectError;


function isRedirect(options, request, response) {
  if (options.followRedirect === false) {
    return false;
  }

  if (typeof(options.followRedirect) === 'function') {
    return options.followRedirect(response);
  }

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


function kwestRedirect(globalOptions) {
  globalOptions = defaults(globalOptions || {}, {
    maxRedirects  : DEFAULT_MAX_REDIRECTS,
    followRedirect: true,
    followAll     : false
  });


  return function (request, next) {
    var redirectsFollowed = 0;
    var options = defaults({
      maxRedirects  : request.maxRedirects,
      followRedirect: request.followRedirect,
      followAll     : request.followAll
    }, globalOptions);

    function followRedirects(response) {
      if (redirectsFollowed >= options.maxRedirects) {
        throw new RedirectError(util.format(
          'Exceeded maxRedirects. Probably stuck in a redirect loop: %s',
          request.uri.href
        ));
      }

      if (isRedirect(options, request, response)) {
        response.data.end();
        var location = response.getHeader('location');

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
