import { ARCHES, findGame, identifyGame, programFiles, programPath } from './lib/installer.js';
import { FLAGS } from './lib/flags.js';
import { LANGUAGES, formatSize, getLanguage, preferredLanguage, setLanguage, t } from './lib/i18n.js';

const chosenBox = document.getElementById('chosen');
const create = document.getElementById('create');
const update = document.getElementById('update');
const bar = document.getElementById('bar');
const logBox = document.getElementById('log');
const detected = document.getElementById('detected');
const status = document.getElementById('status');
const detail = document.getElementById('detail');
const fingerprint = document.getElementById('fingerprint');
const languages = document.getElementById('languages');
const sourceLink = document.getElementById('sourceLink');
const archButtons = document.getElementById('arches');
const TITLE = '虫姫さまふたり / Mushihimesama Futari';
const manifest = fetch('./release/manifest.json').then((r) => r.json());
const LANGUAGE_KEY = 'futari-linux.language';
const ARCH_KEY = 'futari-linux.arch';
// the files the player chose ([{ path, file }]) and what was found in them
let source = null;
let check = 0;
// what the page shows about the chosen game, kept as data so it can be drawn again in another language
let chosenView = null;
let detectedView = null;
// the frame that opened the last download
let downloadFrame = null;
let busy = false;
// whether the chosen game has all its files (an extracted folder may not): otherwise only the update can be made
let complete = false;
// the build of the chosen game (its manifest entry) and the processor the package is made for
let chosenBuild = null;
let arch = 'x86_64';

// On GitHub Pages (<owner>.github.io/<repository>) the source code is the owner's futari-linux repository.
if (location.hostname.endsWith('.github.io')) {
  sourceLink.href = `https://github.com/${location.hostname.split('.')[0]}/futari-linux`;
} else {
  sourceLink.removeAttribute('href');
}

function log(text, error = false) {
  const line = document.createElement('div');
  line.textContent = text;
  if (error) {
    line.className = 'error';
  }
  logBox.appendChild(line);
  logBox.scrollTop = logBox.scrollHeight;
}

function renderChosen() {
  chosenBox.textContent = '';
  if (!chosenView) {
    chosenBox.textContent = t('nothingChosen');
    return;
  }
  const lines = [];
  if (chosenView.game) {
    const name = chosenView.game.name || chosenView.label || 'default.xex';
    lines.push(t('chosenGame', { name, size: formatSize(chosenView.game.size) }));
  }
  for (const d of chosenView.dlc) {
    lines.push(t('chosenDlc', { name: d.name, size: formatSize(d.size) }));
  }
  if (chosenView.game && !chosenView.dlc.length) {
    lines.push(t('chosenNoDlc'));
  }
  for (const line of lines) {
    const div = document.createElement('div');
    div.textContent = line;
    chosenBox.appendChild(div);
  }
}

function showDetected(state, statusText, detailText = '', hash = '') {
  detected.hidden = false;
  detected.className = `detected ${state}`;
  status.textContent = statusText;
  detail.textContent = detailText;
  detail.hidden = !detailText;
  fingerprint.textContent = hash;
  fingerprint.hidden = !hash;
}

function renderDetected() {
  const v = detectedView;
  if (!v) {
    detected.hidden = true;
    return;
  }
  switch (v.kind) {
    case 'checking':
      showDetected('', t('checking'));
      break;
    case 'supported':
      if (!programFiles(chosenBuild, arch)) {
        showDetected('bad', TITLE, t('noBuildForArch', { arch: t(`arch_${arch}`) }));
      } else {
        showDetected('good', TITLE, t(v.dlc ? 'supportedWithDlc' : 'supported'));
      }
      break;
    case 'incomplete':
      showDetected('bad', TITLE, t('incompleteGame', { count: v.count, expected: v.expected }));
      break;
    case 'unsupported':
      showDetected('bad', TITLE, t('unsupported'), v.hash);
      break;
    case 'notGame':
      showDetected('bad', t('notGame'), v.other ? t('otherTitle', { name: v.other }) : t(v.code || 'noGame'));
      break;
    case 'error':
      showDetected('bad', t('notGame'), v.message);
      break;
  }
}

function applyLanguage(code) {
  setLanguage(code);
  document.documentElement.lang = getLanguage();
  for (const el of document.querySelectorAll('[data-i18n]')) {
    el.textContent = t(el.dataset.i18n);
  }
  // our own texts, with <strong>, <code> and the Sphaira link
  for (const el of document.querySelectorAll('[data-i18n-html]')) {
    el.innerHTML = t(el.dataset.i18nHtml);
  }
  languages.setAttribute('aria-label', t('languageBar'));
  for (const button of languages.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(button.dataset.lang === getLanguage()));
  }
  for (const button of archButtons.querySelectorAll('button')) {
    button.textContent = t(`arch_${button.dataset.arch}`);
  }
  renderChosen();
  renderDetected();
}

// The processor: the visitor's last choice, else what the browser says it runs on (Chromium tells through
// userAgentData, Firefox through navigator.platform: "Linux aarch64", "Linux x86_64"), else x86-64.
function detectArch() {
  const platform = String(navigator.platform || '').toLowerCase();
  if (/aarch64|arm64|armv8/.test(platform)) {
    return 'aarch64';
  }
  return 'x86_64';
}
function setArch(value, remember = false) {
  arch = ARCHES.includes(value) ? value : 'x86_64';
  for (const button of archButtons.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(button.dataset.arch === arch));
    button.classList.toggle('primary', button.dataset.arch === arch);
  }
  if (remember) {
    try {
      localStorage.setItem(ARCH_KEY, arch);
    } catch {
      // private windows and blocked storage: the choice just lasts for this visit
    }
  }
  keepProgram();
  setButtons(Boolean(source));
  renderDetected();
}
for (const value of ARCHES) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.arch = value;
  button.addEventListener('click', () => setArch(value, true));
  archButtons.appendChild(button);
}
let savedArch = null;
try {
  savedArch = localStorage.getItem(ARCH_KEY);
} catch {
  savedArch = null;
}
arch = savedArch || detectArch();
if (navigator.userAgentData?.getHighEntropyValues && !savedArch) {
  navigator.userAgentData.getHighEntropyValues(['architecture']).then((v) => {
    if (v.architecture === 'arm') {
      setArch('aarch64');
    } else if (v.architecture === 'x86') {
      setArch('x86_64');
    }
  }, () => {});
}

// The program files of the chosen build for the chosen processor are kept by the browser as soon as both are known,
// so the package can be made even if the connection drops.
function keepProgram() {
  const files = chosenBuild && programFiles(chosenBuild, arch);
  if (!files) {
    return;
  }
  for (const f of files) {
    const url = new URL(programPath(arch, f), location.href).href;
    helper.then((controller) => controller.postMessage({ type: 'keep-program', url }), () => {});
  }
}

for (const { code, name, flag } of LANGUAGES) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.lang = code;
  button.title = name;
  button.setAttribute('aria-label', name);
  button.setAttribute('lang', code);
  button.innerHTML = FLAGS[flag];
  button.addEventListener('click', () => {
    applyLanguage(code);
    try {
      localStorage.setItem(LANGUAGE_KEY, code);
    } catch {
      // private windows and blocked storage: the choice just lasts for this visit
    }
  });
  languages.appendChild(button);
}
let saved = null;
try {
  saved = localStorage.getItem(LANGUAGE_KEY);
} catch {
  saved = null;
}
applyLanguage(preferredLanguage(saved, navigator.languages || [navigator.language]));

function asFiles(entries) {
  return entries.map(({ path, file }) => ({
    path,
    size: file.size,
    read: async (offset, length) => new Uint8Array(await file.slice(offset, offset + length).arrayBuffer()),
  }));
}

// Finds the game in what was chosen and identifies it as soon as it is chosen.
// label: the name of the chosen folder (its files come without it)
async function choose(entries, label = '') {
  const id = ++check;
  source = null;
  chosenBuild = null;
  setButtons(false);
  chosenView = null;
  renderChosen();
  detectedView = { kind: 'checking' };
  renderDetected();
  try {
    const found = await findGame(asFiles(entries));
    if (id !== check) {
      return;
    }
    chosenView = { game: found.game, dlc: found.dlc, label };
    renderChosen();
    if (!found.game) {
      detectedView = { kind: 'notGame', other: found.others[0] };
    } else {
      const game = await identifyGame(found.game.files, await manifest);
      if (id !== check) {
        return;
      }
      if (game.build) {
        source = entries;
        chosenBuild = game.build;
        complete = found.game.files.length >= game.build.game_files;
        detectedView = complete
          ? { kind: 'supported', dlc: found.dlc.length > 0 }
          : { kind: 'incomplete', count: found.game.files.length, expected: game.build.game_files };
        setButtons(true);
        keepProgram();
      } else {
        detectedView = { kind: 'unsupported', hash: game.xexHash };
      }
    }
  } catch (error) {
    if (id !== check) {
      return;
    }
    detectedView = error.code ? { kind: 'notGame', code: error.code } : { kind: 'error', message: error.message };
  }
  renderDetected();
}

document.getElementById('package').addEventListener('change', async (event) => {
  const list = [...event.target.files];
  event.target.value = '';
  if (list.length) {
    await choose(list.map((file) => ({ path: file.name, file })));
  }
});

document.getElementById('folder').addEventListener('change', async (event) => {
  const list = [...event.target.files];
  event.target.value = '';
  if (!list.length) {
    return;
  }
  const top = list[0].webkitRelativePath.split('/')[0] + '/';
  await choose(list.map((file) => ({
    path: file.webkitRelativePath.startsWith(top) ? file.webkitRelativePath.slice(top.length) : file.webkitRelativePath,
    file,
  })), top.slice(0, -1));
});

// The zip is served by sw.js as a normal browser download, streamed while it is being generated.
async function downloadHelper() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('noStreaming');
  }
  // the browser checks sw.js itself with the server on every visit, not with its own cache (see fetchFresh in sw.js)
  await navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' });
  const registration = await navigator.serviceWorker.ready;
  if (navigator.serviceWorker.controller) {
    // a new version of the page brings a new sw.js, which takes over this page while it is open: the files of this
    // visit came through the old one, so the page loads again once, unless the player has already chosen a game
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!chosenView && !reloading) {
        reloading = true;
        location.reload();
      }
    });
  }
  if (!navigator.serviceWorker.controller) {
    const claimed = new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
    // a forced reload (Ctrl+F5) opens the page without its service worker, which then has to take it back
    registration.active.postMessage({ type: 'claim' });
    await claimed;
  }
  // a copy of every page file, so the page can be used again without a connection
  navigator.serviceWorker.controller.postMessage({ type: 'keep-page' });
  return navigator.serviceWorker.controller;
}
let reloading = false;
if ('serviceWorker' in navigator) {
  // sw.js asks every open page which version it is when a new version takes over: this one answers, so it is not
  // reloaded under the player (see refreshOldPages in sw.js)
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'version' && event.ports[0]) {
      event.ports[0].postMessage('current');
    }
  });
  navigator.serviceWorker.startMessages();
}
const helper = downloadHelper();
helper.catch(() => {});

function setButtons(enabled) {
  const available = Boolean(chosenBuild && programFiles(chosenBuild, arch));
  create.disabled = !enabled || busy || !complete || !available;
  update.disabled = !enabled || busy || !available;
}

// update: only the program and the shaders, for a folder that is already installed.
async function makePackage(onlyUpdate) {
  if (!source || busy) {
    return;
  }
  let controller;
  try {
    controller = await helper;
  } catch (error) {
    log(t('error', { message: error.message === 'noStreaming' ? t('noStreaming') : error.message }), true);
    return;
  }
  const filename = onlyUpdate ? `futari-linux-${arch}-update.zip` : `futari-linux-${arch}.zip`;
  busy = true;
  setButtons(false);
  bar.hidden = false;
  bar.value = 0;
  logBox.textContent = '';
  const started = Date.now();
  const channel = new MessageChannel();
  const keepAlive = setInterval(() => controller.postMessage({ type: 'ping' }), 10000);
  const worker = new Worker('./worker.js', { type: 'module' });
  const finish = () => {
    clearInterval(keepAlive);
    worker.terminate();
    busy = false;
    setButtons(Boolean(source));
  };
  worker.onmessage = async ({ data }) => {
    if (data.type === 'log') {
      log(data.text);
    } else if (data.type === 'progress') {
      bar.value = data.fraction;
    } else if (data.type === 'size') {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const ack = new MessageChannel();
      const registered = new Promise((resolve) => (ack.port1.onmessage = resolve));
      controller.postMessage({ type: 'download', id, filename, size: data.size }, [channel.port2, ack.port2]);
      await registered;
      // a hidden frame opens the download: its request is a navigation, which always reaches the service worker
      // (Chrome sends the request of an <a download> link straight to the network, where the file does not exist)
      downloadFrame?.remove();
      downloadFrame = document.createElement('iframe');
      downloadFrame.hidden = true;
      downloadFrame.src = `./download/${id}/${filename}`;
      document.body.appendChild(downloadFrame);
      log(t('downloadStarted', { size: formatSize(data.size) }));
    } else if (data.type === 'done') {
      bar.value = 1;
      log(t('finished', { seconds: Math.round((Date.now() - started) / 1000) }));
      finish();
    } else if (data.type === 'error') {
      log(t('error', { message: data.message }), true);
      finish();
    }
  };
  worker.onerror = (event) => {
    log(t('error', { message: event.message }), true);
    finish();
  };
  worker.postMessage({ entries: source, lang: getLanguage(), update: onlyUpdate, arch, port: channel.port1 },
    [channel.port1]);
}

create.addEventListener('click', () => makePackage(false));
update.addEventListener('click', () => makePackage(true));

setArch(arch);
