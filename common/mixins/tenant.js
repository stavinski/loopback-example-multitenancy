'use strict';

var log = require('debug')('mixin:tenant'),
    _ = require('lodash');

function tenant(Model) {
  var loopback = require('loopback'),
      Tenant = loopback.getModel('Tenant');

  log('applying tenant mixin to %s', Model.modelName);

  function addTenant(ctx, next) {
    var currentTenant = loopback.getCurrentContext().get('tenant'),
        instance = (ctx.instance) ? ctx.instance : ctx.data;

    // for saves we should always have the current tenant to link against
    if (currentTenant) {
      log('adding tenant %s to model %s', currentTenant.id, Model.modelName);
      instance.tenantId = currentTenant.id;
    } else {
      return next(new Error('there is no current tenant'));
    }

    next();
  }

  function filterForDelete(ctx, next) {
    var currentTenant = loopback.getCurrentContext().get('tenant');

    // for deletes we should always have the current tenant to link against
    if (currentTenant) {
      var filter = {
        where: { tenantId: currentTenant.id }
      };

      log('applying query filter for tenant to model', filter);
      _.merge(ctx.query, filter);
    } else {
      return next(new Error('there is no current tenant'));
    }

    next();
  }

  function filterForQuery(ctx, next) {
    var currentTenant = loopback.getCurrentContext().get('tenant');

    if (currentTenant) {
      log('filtering by tenant', currentTenant);

      var filter = {
        where: { tenantId: currentTenant.id }
      };

      log('applying query filter for tenant to model', filter);
      _.merge(ctx.query, filter);
    }

    next();
  }

  // setup relation with tenant
  Model.belongsTo(Tenant, { foreignKey: 'tenantId' });

  // filter so that only models against this tenant are used
  Model.observe('access', filterForQuery);
  Model.observe('before delete', filterForDelete);

  // setup the model using the current tenant
  Model.observe('before save', addTenant);
}

module.exports = tenant;