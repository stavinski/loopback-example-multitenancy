var log = require('debug')('boot:01-tenants-data');

module.exports = function(app, done) {
  var Tenant = app.models.Tenant;
  var tenants = [
    {
      realm: 'bits',
      name: 'Bits and Bobs',
      authenticationEabled: true,
      allowAnonymous: false
    },
    {
      realm: 'doug',
      name: 'Douglas Stores',
      authenticationEabled: true,
      allowAnonymous: false
    }
  ];

  log('setting up tenants');

  Promise.all(tenants.map(function (tenant) {
    return Tenant.findOrCreate({ where: { realm: tenant.realm } }, tenant)
            .then(function (result) {
              if (result[1]) {
                log('created tenant', result[0]);
              } else {
                log('found tenant', result[0]);
              }

              return result[0];
            });
  }))
    .then(function (tenant) { done(null, tenant); })
    .catch(function (err) { done(err, null); });

};
