import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, stat } from 'node:fs/promises';
import vm from 'node:vm';

import manifest from '../package.json' with { type: 'json' };

const require = createRequire(import.meta.url);
const artifacts = [
  manifest.main,
  manifest.module,
  manifest.types,
  './dist/index.umd.js',
];

for (const artifact of artifacts) {
  await stat(new URL(`../${artifact.replace(/^\.\//, '')}`, import.meta.url));
}

assert.equal(manifest.exports['.'].require.default, manifest.main);
assert.equal(manifest.exports['.'].default.default, manifest.module);
assert.equal(manifest.exports['.'].require.types, manifest.types);

const cjs = require('../dist/index.cjs');
const esm = await import('../dist/index.esm.js?package-smoke=1');
for (const [label, api] of [
  ['CommonJS', cjs],
  ['ESM', esm],
]) {
  assert.equal(typeof api.useTravel, 'function', `${label} useTravel export`);
  assert.equal(
    typeof api.useTravelStore,
    'function',
    `${label} useTravelStore export`
  );
}

for (const artifact of [
  manifest.main,
  manifest.module,
  './dist/index.umd.js',
]) {
  const source = await readFile(
    new URL(`../${artifact.replace(/^\.\//, '')}`, import.meta.url),
    'utf8'
  );
  assert.equal(
    source.includes('process.env.NODE_ENV'),
    false,
    `${artifact} has a browser-safe production environment`
  );
}

const umdSource = await readFile(
  new URL('../dist/index.umd.js', import.meta.url),
  'utf8'
);
const umdContext = {
  React: require('react'),
  Travels: require('travels'),
};
vm.runInNewContext(umdSource, umdContext);
assert.equal(typeof umdContext.UseTravel.useTravel, 'function');
assert.equal(typeof umdContext.UseTravel.useTravelStore, 'function');

console.log('Verified use-travel CJS, ESM, and UMD package entries.');
