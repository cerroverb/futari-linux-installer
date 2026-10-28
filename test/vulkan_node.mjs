// Makes the Linux build's vulkan_spirv.bin from the game (disc image or folder) in Node, with the page's code
// (lib/vulkan.js), and prints what the build's "vulkan" entry in release/manifest.json needs.
// Usage: node test/vulkan_node.mjs <disc image or game folder> [--out <file>]
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { chosenOnDisk, loadModules, root } from './node_files.mjs';
import { findGame, identifyGame, lzxStep } from '../lib/installer.js';
import { readXexImage } from '../lib/xex.js';
import { imageContainers } from '../lib/shaders.js';
import { buildVulkanPackage } from '../lib/vulkan.js';

const args = process.argv.slice(2);
const outAt = args.indexOf('--out');
const out = outAt >= 0 ? args.splice(outAt, 2)[1] : null;
const [input] = args;
if (!input) {
  console.error('usage: node test/vulkan_node.mjs <disc image or game folder> [--out <file>]');
  process.exit(1);
}
const sha = (b) => createHash('sha256').update(b).digest('hex');
const started = Date.now();

const { game } = await findGame(chosenOnDisk([input]));
if (!game) {
  throw new Error(`no game in ${input}`);
}
const modules = await loadModules();
const lzx = lzxStep(modules.lzx);
const { xex, xexHash } = await identifyGame(game.files, { builds: [] });
const images = [(await readXexImage(xex, lzx)).image];
const cores = game.files.filter((f) => /^media\/module\/[^/]+\.xex$/i.test(f.path))
  .sort((a, b) => (a.path.toLowerCase() < b.path.toLowerCase() ? -1 : 1));
for (const core of cores) {
  images.push((await readXexImage(await core.read(0, core.size), lzx)).image);
}
console.log(`default.xex SHA-256 ${xexHash}; ${cores.length} game cores`);

// Every stored container goes to the translator once.
const unique = [];
const seen = new Set();
let all = 0;
for (const image of images) {
  for (const c of imageContainers(image)) {
    all++;
    const h = sha(c.bytes);
    if (!seen.has(h)) {
      seen.add(h);
      unique.push(c);
    }
  }
}
console.log(`${all} containers in the images (${unique.length} distinct)`);
const common = fs.readFileSync(path.join(root, 'renut_shader_common.h'));
const { package: pkg, shaders } = await buildVulkanPackage(unique, null, modules, common, () => {});

const entry = {
  cores: cores.length,
  shaders: shaders.map((s) => s.name),
  containers_sha256: [...new Set(shaders.map((s) => sha(unique[s.container].bytes)))].sort(),
  package_sha256: sha(pkg),
  package_size: pkg.length,
};
console.log(`${shaders.length} shaders; early alpha: ` +
  Object.entries(shaders.reduce((m, s) => (s.earlyAlpha ? { ...m, [s.earlyAlpha]: (m[s.earlyAlpha] || 0) + 1 } : m), {}))
    .map(([k, v]) => `${v} ${k}`).join(', '));
console.log('package', pkg.length, 'bytes, SHA-256', sha(pkg));
console.log('manifest entry: "vulkan": ' + JSON.stringify(entry));
if (out) {
  fs.writeFileSync(out, pkg);
  console.log('written', out);
}
console.log(`${((Date.now() - started) / 1000).toFixed(1)} s`);
