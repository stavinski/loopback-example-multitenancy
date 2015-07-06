'use strict';

var log = require('debug')('middleware:tenant-key'),
    loopback = require('loopback');

function createError(status, msg) {
  var err = new Error(msg);
  err.statusCode = status;
  return err;
}

module.exports = function tenantKey(options) {
  var tenantHeader = options.tenantHeader || 'X-Tenant-Key';
  log('initialized with options', options);

  return function tenantKeyAuthHandler(req, res, next) {
    var app = req.app,
        Tenant = app.models.Tenant,
        appId,
        clientKey;

    log('in middleware handler');

    if (!req.get(tenantHeader)) {
      log('no tenant key found');
      return next(createError(401, 'no tenant key found'));
    }

    var raw = new Buffer(req.get(tenantHeader), 'base64').toString(),
        items = raw.split(':');

    appId = items[0];
    clientKey = items[1];

    log('appId supplied', appId);
    log('clientKey supplied', clientKey);

    Tenant.authenticate(appId, clientKey, function auth(err, tenant) {
      var ctx = loopback.getCurrentContext();

      if (err) {
        return next(err);
      }

      if (tenant) {
        log('setting tenant to current context', tenant);
        ctx.set('tenant', tenant.application);

        return next();
      }

      return next(createError(403, 'invalid tenant key'));
    });
  };
};