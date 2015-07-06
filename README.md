# Loopback Example Multi-tenancy

This example demonstrates a strategy for allowing multi-tenancy by partitioning data based off
a `Tenant` model, I have tried to make it so that minimal effort is required in order to support
this.

## General Pattern

Client consumers of the service will need to provide a tenant key via a http header (`X-Tenant-Key`)
this is has the format of:

```
key = base64(tenantId + ":" + clientKey)
```

When the key is provided the tenant is retrieved and set onto the current context, a `Tenant` mixin
which should be configured against any models that need to be multi-tenant will filter against
the current tenant using the before model hooks, this ensures that only the data for the current
tenant is used.

## Requirements for a new multi-tenant model

1. The model must be configured to use the `Tenant` mixin:

```json
{
  "mixins": {
    "Tenant": true
  }
}
```

2. The model needs to be added to the middleware paths config:

```json
{
  "auth:before": {
    "./middleware/tenant-key": {
      "paths": ["/api/shops", "/api/mynewmodelhere"],
      "params": {}
    }
  }
}
```

Now you should be all set!

## Running the example

```
npm install
DEBUG=boot:*,mixin:*,middleware:* node .
```

Due to the shops API requiring the `X-Tenant-Key` header you can't use the API explorer,
instead I would recommend [postman](https://www.getpostman.com/)

or using curl:

```
curl -X GET -H "X-Tenant-Key: NjlmNzI0MWViMzljM2Q4NTk2ZGJlN2MyOGQzY2YwZmQ6YmI4MDFiZTNmZDZlMGMyMDBjNGI5OTJiMTVlNGIwZDU5MGMyNGQ0MA=="
-H "Cache-Control: no-cache" -H "Postman-Token: a88a30cf-c150-fdcd-5144-c90b7b15d855" 'http://localhost:3000/api/Shops'
```