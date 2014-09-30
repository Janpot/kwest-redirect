var kwestRedirect = require('../index'),
    mock      = require('kwest-mock'),
    assert    = require('chai').assert;

describe('kwest-redirect', function () {

  it('shouldn\'t redirect on good status', function (done) {

    var redirectKwest = mock(function (request, respond) {
      return respond({
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

    var redirectKwest = mock(function (request, respond) {
      return respond({
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

    var redirectKwest = mock(function (request, respond) {
      if (request.uri.href === 'http://www.example.com/') {
        hasRedirected = true;
        return respond({
          statusCode: 301, 
          headers: {
            location: 'relative'
          }
        });
      } else if (request.uri.href === 'http://www.example.com/relative') {
        return respond({
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

    var redirectKwest = mock(function (request, respond) {
      if (request.uri.href === 'http://www.example.com/') {
        hasRedirected = true;
        return respond({
          statusCode: 301,
          headers: {
            location: 'http://www.example2.com/'
          }
        });
      } else if (request.uri.href === 'http://www.example2.com/') {
        return respond({
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

    var redirectKwest = mock(function (request, respond) {
      // redirect loop
      requestCount += 1;
      return respond({
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

  it('options should override global', function (done) {
    var redirectKwest = mock(function (request, respond) {
      return respond({
        statusCode: 301,
        headers: {
          location: 'http://www.example.com/landing'
        }
      });
    }).use(kwestRedirect({ followRedirects: true }));

    redirectKwest({ uri: 'http://www.example.com', followRedirects: false })
      .then(function (res) {
        assert.strictEqual(res.statusCode, 301);
        assert.strictEqual(
          res.getHeader('location'), 'http://www.example.com/landing'
        );
        done();
      })
      .catch(done);

  });

});
