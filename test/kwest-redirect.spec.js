var kwestRedirect = require('..'),
    Promise   = require('bluebird'),
    kwest     = require('kwest-base'),
    assert    = require('chai').assert;

describe('kwest-redirect', function () {

  it('shouldn\'t redirect on good status', function (done) {

    var kwestMock = kwest.wrap(function (request, next) {
      return Promise.resolve({
        statusCode: 200
      });
    });

    var redirectKwest = kwestMock.wrap(kwestRedirect());
    redirectKwest('http://www.example.com')
      .then(function (res) {
        done();
      })
      .catch(done);

  });

  it('should error on missing location', function (done) {

    var kwestMock = kwest.wrap(function (request, next) {
      return Promise.resolve({
        statusCode: 301
      });
    });

    var redirectKwest = kwestMock.wrap(kwestRedirect());
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

    var kwestMock = kwest.wrap(function (request, next) {
      if (request.uri.href === 'http://www.example.com/') {
        hasRedirected = true;
        return Promise.resolve({
          statusCode: 301,
          headers: {
            location: 'relative'
          }
        });
      } else if (request.uri.href === 'http://www.example.com/relative') {
        return Promise.resolve({
          statusCode: 200,
          body: 'hello'
        });
      }

      throw new Error('Unrecognized url ' + request.uri.href);
    });

    var redirectKwest = kwestMock.wrap(kwestRedirect());
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

    var kwestMock = kwest.wrap(function (request, next) {
      if (request.uri.href === 'http://www.example.com/') {
        hasRedirected = true;
        return Promise.resolve({
          statusCode: 301,
          headers: {
            location: 'http://www.example2.com/'
          }
        });
      } else if (request.uri.href === 'http://www.example2.com/') {
        return Promise.resolve({
          statusCode: 200,
          body: 'hello'
        });
      }

      throw new Error('Unrecognized url ' + request.uri.href);
    });

    var redirectKwest = kwestMock.wrap(kwestRedirect());
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

    var kwestMock = kwest.wrap(function (request, next) {
      // redirect loop
      requestCount += 1;
      return Promise.resolve({
        statusCode: 301,
        headers: {
          location: 'http://www.example.com'
        }
      });
    });

    var redirectKwest = kwestMock.wrap(kwestRedirect({
      maxRedirects: 5
    }));
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
