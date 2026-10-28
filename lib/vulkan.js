// The shaders of the Linux build's renderer (Renut on Vulkan, futari-linux), made from the player's own executables:
// vulkan_spirv.bin, which the Linux executable reads beside itself (a release build carries no game shader, as the
// Switch NRO carries none and reads deko3d_glsl.bin).
//
// The chain is lib/deko3d.js's up to DXC, without the deko3d steps after it:
//   lib/shaders.js     imageContainers(): the containers stored in default.xex and the eight game cores
//   wasm/renut_hlsl    Renut's translator: container -> HLSL (and the numbers of the shader table)
//   lib/early_alpha    tools/renut_early_alpha.py: the alpha-tested pixel shaders' early alpha copy
//   wasm/dxc_web       DXC v2025.1 -> SPIR-V. RENUT_RECOMP comes first in the text as a #define line (no
//                      BANJO_DEKO3D: the Vulkan form of Renut's HLSL). The vertex shaders keep DXC's -fvk-invert-y,
//                      which the native Vulkan build compiles with too (XenosRecomp's dxc_compiler.cpp).
//
// The file (read by app/src/renut_engine/gpu/render/shader_library.cpp, futari-linux):
//   header (32 bytes): "BVKS", version 1, count, 0, table offset, data offset, 0, 0
//   table: per shader (56 bytes, sorted by hash): u64 hash, u32 offset (from the data), compressed size, size, stage
//          (0 vertex, 4 pixel), 8 x u32 bool specialization constant mask (SpecIds 1000-1255 the SPIR-V decorates)
//   data: one zstd frame of raw blocks per shader (lib/deko3d_package.js zstdRawFrame), each 8-byte aligned
// The layout is deko3d_glsl.bin's (lib/deko3d_package.js) with SPIR-V in place of GLSL and its own magic.

import { zstdRawFrame } from './deko3d_package.js';
import { translateContainers } from './deko3d.js';
import { renutEarlyAlpha } from './early_alpha.js';

const DXC_PREAMBLE = '#define RENUT_RECOMP 1\n';

// The bool specialization constants a SPIR-V module decorates (OpDecorate <id> SpecId 1000-1255), the mask
// shader_library.cpp's ShaderBoolSpecMask reads from the SPIR-V itself.
export function spirvBoolMask(spirv) {
  const mask = new Uint32Array(8);
  const words = new Uint32Array(spirv.buffer, spirv.byteOffset, spirv.byteLength >>> 2);
  if (words.length < 5 || words[0] !== 0x07230203) {
    throw new Error('vulkan: not a SPIR-V module');
  }
  for (let i = 5; i < words.length;) {
    const length = words[i] >>> 16;
    const opcode = words[i] & 0xffff;
    if (length === 0) break;
    if (opcode === 71 && length >= 4 && i + 3 < words.length && words[i + 2] === 1) {
      const id = words[i + 3];
      if (id >= 1000 && id < 1256) mask[(id - 1000) >> 5] |= 1 << ((id - 1000) & 31);
    }
    i += length;
  }
  return mask;
}

// shaders: [{ name: 'ps_558CF34EF8661CAE', spirv: Uint8Array }]. Returns the file (Uint8Array).
export function writeVulkanPackage(shaders) {
  const encoder = new TextEncoder();
  const entries = shaders.map(({ name, spirv }) => {
    const m = /^(vs|ps)_([0-9A-F]{16})$/.exec(name);
    if (!m) throw new Error(`vulkan package: bad shader name ${name}`);
    return { hash: BigInt('0x' + m[2]), stage: m[1] === 'ps' ? 4 : 0, spirv, frame: zstdRawFrame(spirv),
             mask: spirvBoolMask(spirv) };
  });
  entries.sort((a, b) => (a.hash < b.hash ? -1 : a.hash > b.hash ? 1 : 0));
  const tableOffset = 32;
  const dataOffset = tableOffset + 56 * entries.length;
  let dataSize = 0;
  for (const e of entries) {
    e.offset = dataSize;
    dataSize += e.frame.length;
    dataSize += (8 - (dataSize % 8)) % 8;
  }
  const out = new Uint8Array(dataOffset + dataSize);
  const view = new DataView(out.buffer);
  out.set(encoder.encode('BVKS'), 0);
  view.setUint32(4, 1, true);
  view.setUint32(8, entries.length, true);
  view.setUint32(12, 0, true);
  view.setUint32(16, tableOffset, true);
  view.setUint32(20, dataOffset, true);
  entries.forEach((e, i) => {
    const at = tableOffset + 56 * i;
    view.setBigUint64(at, e.hash, true);
    view.setUint32(at + 8, e.offset, true);
    view.setUint32(at + 12, e.frame.length, true);
    view.setUint32(at + 16, e.spirv.length, true);
    view.setUint32(at + 20, e.stage, true);
    for (let k = 0; k < 8; ++k) view.setUint32(at + 24 + 4 * k, e.mask[k], true);
    out.set(e.frame, dataOffset + e.offset);
  });
  return out;
}

// containers, names, modules ({ renutHlsl, dxc }, fresh instances), shaderCommon: as lib/deko3d.js
// buildDeko3dPackage. Returns { package, shaders: [{ name, spirv, container, earlyAlpha }] }.
export async function buildVulkanPackage(containers, names, modules, shaderCommon, log = () => {}) {
  const { renutHlsl, dxc } = modules;
  const translated = translateContainers(containers, renutHlsl, shaderCommon);
  names = names ?? [...translated.keys()].sort();
  const missing = names.filter((n) => !translated.has(n));
  if (missing.length) {
    throw new Error(`vulkan: ${missing.join(', ')} not among the translated shaders`);
  }
  dxc.FS.mkdirTree('/vulkan');
  const shaders = [];
  for (const name of names) {
    const vertex = name.startsWith('vs_');
    let { hlsl } = translated.get(name);
    let earlyAlpha = null;
    if (!vertex) {
      const ea = renutEarlyAlpha(name.toLowerCase(), hlsl);
      hlsl = ea.hlsl;
      earlyAlpha = ea.status;
    }
    dxc.FS.writeFile(`/vulkan/${name}.hlsl`, DXC_PREAMBLE + hlsl);
    const rc = dxc.ccall('compile', 'number', ['string', 'string', 'number'],
                         [`/vulkan/${name}.hlsl`, `/vulkan/${name}.spv`, vertex ? 1 : 0]);
    if (rc !== 0) {
      throw new Error(`vulkan: DXC rejected ${name} (${rc})`);
    }
    const spirv = dxc.FS.readFile(`/vulkan/${name}.spv`);
    shaders.push({ name, spirv, container: translated.get(name).container, earlyAlpha });
    log(`vulkan: ${name}`);
  }
  return { package: writeVulkanPackage(shaders), shaders };
}
