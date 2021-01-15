import { moduleFor, test } from 'ember-qunit';
import { get } from '@ember/object';
import repo from 'consul-ui/tests/helpers/repo';
const NAME = 'auth-method';
moduleFor(`service:repository/${NAME}`, `Integration | Service | ${NAME}`, {
  // Specify the other units that are required for this test.
  integration: true,
});
const now = new Date().getTime();
const dc = 'dc-1';
const id = 'auth-method-name';
const undefinedNspace = 'default';
[undefinedNspace, 'team-1', undefined].forEach(nspace => {
  test(`findByDatacenter returns the correct data for list endpoint when nspace is ${nspace}`, function(assert) {
    get(this.subject(), 'store').serializerFor(NAME).timestamp = function() {
      return now;
    };
    return repo(
      'AuthMethod',
      'findAllByDatacenter',
      this.subject(),
      function retrieveStub(stub) {
        return stub(
          `/v1/acl/auth-methods?dc=${dc}${typeof nspace !== 'undefined' ? `&ns=${nspace}` : ``}`,
          {
            CONSUL_AUTH_METHOD_COUNT: '100',
          }
        );
      },
      function performTest(service) {
        return service.findAllByDatacenter(dc, nspace || undefinedNspace);
      },
      function performAssertion(actual, expected) {
        assert.deepEqual(
          actual,
          expected(function(payload) {
            return payload.map(item =>
              Object.assign({}, item, {
                SyncTime: now,
                Datacenter: dc,
                Namespace: item.Namespace || undefinedNspace,
                uid: `["${item.Namespace || undefinedNspace}","${dc}","${item.Name}"]`,
              })
            );
          })
        );
      }
    );
  });
  test(`findBySlug returns the correct data for item endpoint when the nspace is ${nspace}`, function(assert) {
    return repo(
      'AuthMethod',
      'findBySlug',
      this.subject(),
      function retrieveStub(stub) {
        return stub(
          `/v1/acl/auth-method/${id}?dc=${dc}${
            typeof nspace !== 'undefined' ? `&ns=${nspace}` : ``
          }`
        );
      },
      function performTest(service) {
        return service.findBySlug(id, dc, nspace || undefinedNspace);
      },
      function performAssertion(actual, expected) {
        assert.deepEqual(
          actual,
          expected(function(payload) {
            const item = payload;
            return Object.assign({}, item, {
              Datacenter: dc,
              Namespace: item.Namespace || undefinedNspace,
              uid: `["${item.Namespace || undefinedNspace}","${dc}","${item.Name}"]`,
              meta: {
                cacheControl: undefined,
                cursor: undefined,
                dc: dc,
                nspace: item.Namespace || undefinedNspace,
              },
            });
          })
        );
      }
    );
  });
});
