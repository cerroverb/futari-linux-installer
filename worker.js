// Runs the whole package build off the main thread and streams the zip to the download service worker.
import createDxcModule from './wasm/dxc_web.mjs';
import createLzxModule from './wasm/lzx.mjs';
import createRenutHlslModule from './wasm/renut_hlsl.mjs';
import { createPackage, findGame, identifyGame, programFiles, programPath } from './lib/installer.js';
import { setLanguage, t } from './lib/i18n.js';

const log = (text) => postMessage({ type: 'log', text });
const progress = (fraction) => postMessage({ type: 'progress', fraction });

async function fetchBytes(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(t('downloadFailed', { url, status: response.status }));
  }
  return new Uint8Array(await response.arrayBuffer());
}

async function sha256(bytes) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Sends every write as one chunk, and only when the download has asked for more ("pull").
function portSink(port) {
  let credits = 0;
  let cancelled = false;
  let waiting = null;
  port.onmessage = ({ data }) => {
    if (data.type === 'pull') {
      credits++;
    } else if (data.type === 'cancel') {
      cancelled = true;
    }
    if (waiting) {
      const wake = waiting;
      waiting = null;
      wake();
    }
  };
  return {
    async write(bytes) {
      while (!credits) {
        if (cancelled) {
          throw new Error(t('cancelled'));
        }
        await new Promise((resolve) => (waiting = resolve));
      }
      if (cancelled) {
        throw new Error(t('cancelled'));
      }
      credits--;
      const copy = bytes.slice();
      port.postMessage({ type: 'chunk', buffer: copy.buffer }, [copy.buffer]);
    },
    async close() {
      port.postMessage({ type: 'end' });
    },
    fail(message) {
      port.postMessage({ type: 'error', message });
    },
  };
}

// The files the page received from the player, in the form lib/installer.js reads them.
function chosenFiles(entries) {
  return entries.map(({ path, file }) => ({
    path,
    size: file.size,
    read: async (offset, length) => new Uint8Array(await file.slice(offset, offset + length).arrayBuffer()),
  }));
}

const quiet = () => ({ print: () => {}, printErr: () => {} });

self.onmessage = async ({ data }) => {
  setLanguage(data.lang);
  const sink = portSink(data.port);
  try {
    log(t('readingFiles'));
    const chosen = await findGame(chosenFiles(data.entries));
    if (!chosen.game) {
      throw new Error(t('noGame'));
    }
    const manifest = JSON.parse(new TextDecoder().decode(await fetchBytes('./release/manifest.json')));
    const { build, xexHash } = await identifyGame(chosen.game.files, manifest);
    if (!build) {
      throw new Error(t('notSupportedYet', { hash: xexHash }));
    }
    const files = programFiles(build, data.arch);
    if (!files) {
      throw new Error(t('noBuildForArch', { arch: data.arch }));
    }
    log(t('downloadingBuild', { arch: data.arch }));
    const [renutShaderCommon, ...bytes] = await Promise.all([
      // Renut's translator header (futari-linux's app/thirdparty/reblue-XenosRecomp/XenosRecomp/)
      fetchBytes('./renut_shader_common.h'),
      ...files.map((f) => fetchBytes(programPath(data.arch, f))),
    ]);
    const program = [];
    for (let i = 0; i < files.length; i++) {
      const hash = await sha256(bytes[i]);
      if (hash !== files[i].sha256) {
        throw new Error(t('buildMismatch', { name: files[i].name, hash }));
      }
      program.push({ name: files[i].name, bytes: bytes[i], mode: files[i].mode ?? 0o644 });
    }
    const modules = {
      dxc: await createDxcModule(quiet()),
      lzx: await createLzxModule(quiet()),
      renutHlsl: await createRenutHlslModule(quiet()),
    };
    const release = { manifest, arch: data.arch, program, renutShaderCommon };
    const result = await createPackage(chosen, release, modules, sink, log, progress,
      (size) => postMessage({ type: 'size', size }), { update: Boolean(data.update) });
    postMessage({ type: 'done', result });
  } catch (error) {
    const message = error.message || String(error);
    sink.fail(message);
    postMessage({ type: 'error', message });
  }
};
