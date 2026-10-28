// futari-linux-installer: fills and checks the Linux parts of release/manifest.json.
//
//   node tools/linux_manifest.mjs files <aarch64|x86_64> <folder>
//       Lists every file of an extracted Linux release (tools/linux/package.sh --release in futari-linux: the
//       futari-linux-<arch> folder of futari-linux-<arch>.tar.gz) under the build's "linux" entry: name, SHA-256,
//       size and permissions.
//   node tools/linux_manifest.mjs vulkan <vulkan_spirv.bin>
//       Pins the shaders the page makes (test/vulkan_node.mjs --out writes them from your own game) by SHA-256 and size.
//   node tools/linux_manifest.mjs check
//       Checks that every program file the manifest names is in release/<arch>/ with its SHA-256 and size (the
//       deployment runs it after extracting the release).
//
// The manifest holds one build; these commands change its first entry.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const MANIFEST = 'release/manifest.json';
const ARCHES = ['aarch64', 'x86_64'];
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const [command, ...args] = process.argv.slice(2);
const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const build = manifest.builds[0];
const save = () => fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');

if (command === 'files') {
  const [arch, folder] = args;
  if (!ARCHES.includes(arch) || !folder) {
    console.error('usage: node tools/linux_manifest.mjs files <aarch64|x86_64> <folder>');
    process.exit(2);
  }
  const files = fs.readdirSync(folder).sort().map((name) => {
    const full = path.join(folder, name);
    const stat = fs.statSync(full);
    if (!stat.isFile()) {
      throw new Error(`${full}: not a file (a release folder holds files only)`);
    }
    const bytes = fs.readFileSync(full);
    return { name, sha256: sha256(bytes), size: bytes.length, mode: stat.mode & 0o777 };
  });
  for (const required of ['futari', 'futari.sh', 'futari.toml', 'librexruntime.so']) {
    if (!files.some((f) => f.name === required)) {
      throw new Error(`${folder}: no ${required}`);
    }
  }
  if (files.some((f) => /^(vulkan_spirv\.bin|game_root|dlc)$/.test(f.name))) {
    throw new Error(`${folder}: game data in a release folder`);
  }
  build.linux = build.linux || {};
  build.linux[arch] = { files };
  save();
  console.log(`${arch}: ${files.length} files, ${files.reduce((s, f) => s + f.size, 0)} bytes`);
} else if (command === 'vulkan') {
  const [file] = args;
  const bytes = fs.readFileSync(file);
  if (bytes.subarray(0, 4).toString('latin1') !== 'BVKS') {
    throw new Error(`${file}: not a vulkan_spirv.bin`);
  }
  build.vulkan.package_sha256 = sha256(bytes);
  build.vulkan.package_size = bytes.length;
  save();
  console.log(`vulkan: ${bytes.length} bytes, SHA-256 ${build.vulkan.package_sha256}`);
} else if (command === 'check') {
  let bad = 0;
  if (!build.vulkan?.package_sha256) {
    console.error('the shaders are not pinned yet (tools/linux_manifest.mjs vulkan)');
    bad++;
  }
  const arches = Object.keys(build.linux || {});
  if (!arches.length) {
    console.error('no Linux build in the manifest (tools/linux_manifest.mjs files)');
    bad++;
  }
  for (const arch of arches) {
    for (const f of build.linux[arch].files) {
      const full = path.join('release', arch, f.name);
      if (!fs.existsSync(full)) {
        console.error(`missing: ${full}`);
        bad++;
        continue;
      }
      const bytes = fs.readFileSync(full);
      if (bytes.length !== f.size || sha256(bytes) !== f.sha256) {
        console.error(`wrong: ${full} is not the file the manifest names`);
        bad++;
      }
    }
    console.log(`${arch}: ${build.linux[arch].files.length} files checked`);
  }
  process.exit(bad ? 1 : 0);
} else {
  console.error('usage: node tools/linux_manifest.mjs files <arch> <folder> | vulkan <file> | check');
  process.exit(2);
}
