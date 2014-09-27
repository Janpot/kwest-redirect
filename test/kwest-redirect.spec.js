var kwestRedirect = require('..'),
    Promise   = require('bluebird'),
    kwest     = require('kwest-base'),
    caseless  = require('caseless'),
    assert    = require('chai').assert;

describe('kwest-redirect', function () {

  function mockResponse(response) {
    response.headers = response.headers || {};
    caseless.httpify(response, response.headers);
    return Promise.resolve(response);
  }

  it('shouldn\'t redirect on good status', function (done) {

    var redirectKwest = kwest(function (request) {
      return mockResponse({
        statusCode: 200
      });
    }).use(kwestRedirect());

    redirectKwest('http://www.example.com')
      .then(function (res) {
        done();
      })
      .catch(done);

  });

  it('should error on missing location', function (done) {

    var redirectKwest = kwest(function (request) {
      return mockResponse({
        statusCode: 301
      });
    }).use(kwestRedirect());

    redirectKwest('http://www.example.com')
      .then(function (res) {
        done(new Error('error expected'));
      })
      .catch(kwestRedirect.RedirectError, function (err) {
        done();
      })
      .catch(done);

  });

  it('should redirect relative', function (done) {

    var hasRedirected = false;

    var redirectKwest = kwest(function (request) {
      if (request.uri.href === 'http://www.example.com/') {
        hasRedirected = true;
        return mockResponse({
          statusCode: 301, 
          headers: {
            location: 'relative'
          }
        });
      } else if (request.uri.href === 'http://www.example.com/relative') {
        return mockResponse({
          statusCode: 200,
          body: 'hello'
        });
      }

      throw new Error('Unrecognized url ' + request.uri.href);
    }).use(kwestRedirect());

    redirectKwest('http://www.example.com')
      .then(function (res) {
        assert.ok(hasRedirected, 'should have redirected');
        assert.propertyVal(res, 'body' , 'hello');
        done();
      })
      .catch(done);

  });

  it('should redirect absolute', function (done) {

    var hasRedirected = false;

    var redirectKwest = kwest(function (request) {
      if (request.uri.href === 'http://www.example.com/') {
        hasRedirected = true;
        return mockResponse({
          statusCode: 301,
          headers: {
            location: 'http://www.example2.com/'
          }
        });
      } else if (request.uri.href === 'http://www.example2.com/') {
        return mockResponse({
          statusCode: 200,
          body: 'hello'
        });
      }

      throw new Error('Unrecognized url ' + request.uri.href);
    }).use(kwestRedirect());

    redirectKwest('http://www.example.com')
      .then(function (res) {
        assert.ok(hasRedirected, 'should have redirected');
        assert.propertyVal(res, 'body' , 'hello');
        done();
      })
      .catch(done);

  });

  it('should respect maxRedirects', function (done) {

    var requestCount = 0;

    var redirectKwest = kwest(function (request) {
      // redirect loop
      requestCount += 1;
      return mockResponse({
        statusCode: 301,
        headers: {
          location: 'http://www.example.com/' + requestCount
        }
      });
    }).use(kwestRedirect({ maxRedirects: 5 }));

    redirectKwest('http://www.example.com')
      .then(function (res) {
        done(new Error('Redirect loop expected'));
      })
      .catch(kwestRedirect.RedirectError, function () {
        assert.strictEqual(requestCount, 6);
        done();
      })
      .catch(done);

  });

});
