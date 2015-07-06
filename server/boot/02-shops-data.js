var log = require('debug')('boot:02-shops-data'),
    loopback = require('loopback');

module.exports = function(app, done) {
  var Tenant = app.models.Tenant,
      Shop = app.models.Shop;

  function bitsShops() {
    return Tenant.findOne({ where: { realm: 'bits' } })
            .then(function (tenant) {
              return new Promise(function (resolve, reject) {
                loopback.runInContext(function () {
                  var ctx = loopback.getCurrentContext();
                  ctx.set('tenant', tenant);

                  log('adding shops to bits and bobs tenant');

                  Shop.create([
                    { name: 'Douglas Bits and Bobs',
                      location: { lat: 54.1630687 , lng: -4.4799375 } },
                    { name: 'Peels Bits and Bobs',
                      location: { lat: 54.2121862 , lng: -4.6914243 } },
                  ], function (err, results) {
                    if (err) {
                      reject(err);
                    } else {
                      resolve(results);
                    }
                  });
                });
              });
            });
  }

  function dougShop() {
    return Tenant.findOne({ where: { realm: 'doug' } })
            .then(function (tenant) {
              return new Promise(function (resolve, reject) {
                loopback.runInContext(function () {
                  var ctx = loopback.getCurrentContext();
                  ctx.set('tenant', tenant);

                  log('adding shops to douglas stores tenant');

                  Shop.create({
                    name: 'Douglas Store',
                    location: { lat: 54.1571559 , lng: -4.4843247 }
                  },
                  function (err, results) {
                    if (err) {
                      reject(err);
                    } else {
                      resolve(results);
                    }
                  });
                });
              });
            });
  }

  Promise.all([bitsShops(), dougShop()])
    .then(function (results) {
      log('added shops to tenants');
      log(results);
      done(null, results);
    })
    .catch(function (err) { log(err); done(err, null); });

};
