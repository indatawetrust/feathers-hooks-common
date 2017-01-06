
import { assert } from 'chai';
import hooks from '../../../src/hooks';

var hook;
var hookBefore;
var hookAfter;
var hookFcnSyncCalls;
var hookFcnAsyncCalls;
var hookFcnCbCalls;
var predicateParam1, predicateParam2, predicateParam3, predicateParam4;

const hookFcnSync = (hook) => {
  hookFcnSyncCalls = +1;
  hook.data.first = hook.data.first.toLowerCase();

  return hook;
};

const hookFcnAsync = (hook) => new Promise(resolve => {
  hookFcnAsyncCalls = +1;
  hook.data.first = hook.data.first.toLowerCase();

  resolve(hook);
});

const hookFcnCb = (hook, cb) => {
  hookFcnCbCalls = +1;

  cb(null, hook);
};

const predicateTrue = (hook, more2, more3, more4) => {
  predicateParam1 = hook;
  predicateParam2 = more2;
  predicateParam3 = more3;
  predicateParam4 = more4;

  return true;
};

describe('hooks iffElse', () => {
  beforeEach(() => {
    hookBefore = { type: 'before', method: 'create', data: { first: 'John', last: 'Doe' } };
    hookAfter = { type: 'before', method: 'create', data: { first: 'john', last: 'Doe' } };
    hook = clone(hookBefore);
    hookFcnSyncCalls = 0;
    hookFcnAsyncCalls = 0;
  });

  describe('runs multiple hooks', () => {
    it('when true', () => {
      return hooks.iffElse(true, [hookFcnSync, hookFcnAsync, hookFcnCb], null)(hook)
        .then(hook => {
          assert.deepEqual(hook, hookAfter);
          assert.equal(hookFcnSyncCalls, 1);
          assert.equal(hookFcnAsyncCalls, 1);
          assert.equal(hookFcnCbCalls, 1);
          assert.deepEqual(hook, hookAfter);
        });
    });

    it('when false', () => {
      return hooks.iffElse(false, null, [hookFcnSync, hookFcnAsync, hookFcnCb])(hook)
        .then(hook => {
          assert.deepEqual(hook, hookAfter);
          assert.equal(hookFcnSyncCalls, 1);
          assert.equal(hookFcnAsyncCalls, 1);
          assert.equal(hookFcnCbCalls, 1);
          assert.deepEqual(hook, hookAfter);
        });
    });
  });

  describe('predicate gets right params', () => {
    it('when true', () => {
      return hooks.iffElse(predicateTrue, [hookFcnSync, hookFcnAsync, hookFcnCb], null)(hook)
        .then(() => {
          assert.deepEqual(predicateParam1, hook, 'param1');
          assert.strictEqual(predicateParam2, undefined, 'param2');
          assert.strictEqual(predicateParam3, undefined, 'param3');
          assert.strictEqual(predicateParam4, undefined, 'param4');
        });
    });

    it('every passes on correct params', () => {
      return hooks.iffElse(
        hooks.every(predicateTrue), [hookFcnSync, hookFcnAsync, hookFcnCb], null
      )(hook)
        .then(() => {
          assert.deepEqual(predicateParam1, hook, 'param1');
          assert.strictEqual(predicateParam2, undefined, 'param2');
          assert.strictEqual(predicateParam3, undefined, 'param3');
          assert.strictEqual(predicateParam4, undefined, 'param4');
        });
    });

    it('some passes on correct params', () => {
      return hooks.iffElse(
        hooks.some(predicateTrue), [hookFcnSync, hookFcnAsync, hookFcnCb], null
      )(hook)
        .then(() => {
          assert.deepEqual(predicateParam1, hook, 'param1');
          assert.strictEqual(predicateParam2, undefined, 'param2');
          assert.strictEqual(predicateParam3, undefined, 'param3');
          assert.strictEqual(predicateParam4, undefined, 'param4');
        });
    });
  });
});

// Helpers

function clone (obj) {
  return JSON.parse(JSON.stringify(obj));
}