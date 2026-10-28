// Interface texts in English and Japanese. Works in the page and in the worker (no DOM here).
// Static texts in index.html name their key with data-i18n (plain text) or data-i18n-html (text with markup).

export const LANGUAGES = [
  { code: 'en', name: 'English', flag: 'uk' },
  { code: 'ja', name: '日本語', flag: 'japan' },
];

const UPSTREAM = '<a href="https://github.com/ChanseyIsTheBest/futari-nx" target="_blank" rel="noopener">futari-nx</a>';
const DLC_PATH = '<code>Content/&lt;profile&gt;/435A07D7/00000002</code>';

const TEXTS = {
  en: {
    legal:
      'Mushihimesama Futari is a trademark of CAVE Interactive. The icon artwork is © CAVE. futari-linux is an unofficial fan project and is not affiliated with, endorsed or sponsored by CAVE or Microsoft. Xbox 360 is a trademark of Microsoft. This site does not host or distribute game data, the original game executable or any shader of the game: your disc image is read only inside your browser, is never uploaded, and its files and the shaders made from them go straight into the zip saved on your computer. You need your own legally obtained copy of the game.',
    sourceCode: 'Source code',
    signature: `the Linux fork, by cerroverb, of ChanseyIsTheBest's ${UPSTREAM}`,
    lead:
      'Builds the native <strong>Linux</strong> package of <strong>Mushihimesama Futari Ver 1.5</strong> from your own ' +
      '<strong>Xbox 360</strong> disc. Everything runs in <strong>this browser</strong>.',
    languageBar: 'Language',
    step1: '1. Choose your game',
    formatPackage: 'Disc image',
    formatFolder: 'Folder',
    ownCopy:
      '<strong>Important:</strong> you need your own copy of the game, dumped from your own disc. The installer reads the game from it to make the package; without it, it cannot be made. Every game file and every shader in the package comes from your copy: the installer does not supply any of its own.',
    formatHint:
      "<strong>Disc image:</strong> your game's <code>.iso</code> (a full disc dump, or an image rebuilt by extract-xiso). You can choose the <strong>Black Label</strong> and <strong>Ver 1.01</strong> DLC package files along with it (on the console they are in " + DLC_PATH + '). ' +
      '<strong>Folder:</strong> a folder you extracted the game into (with <code>default.xex</code>); DLC package files or unpacked DLC folders inside it are found too.',
    nothingChosen: 'Nothing chosen yet.',
    chosenGame: 'Game: {name} ({size})',
    chosenDlc: 'DLC: {name} ({size})',
    chosenNoDlc: 'No DLC (optional: Black Label, Ver 1.01)',
    step2: '2. Create the package',
    step2Arch: 'The processor of the Linux device it is for:',
    step2ArchHint:
      '<strong>ARM64</strong> for ARM handhelds such as the AYN Odin 3, <strong>x86-64</strong> for PCs, laptops, the Steam Deck and the ROG Ally. In a terminal on that device, <code>uname -m</code> prints <code>aarch64</code> or <code>x86_64</code>.',
    arch_aarch64: 'ARM64 (aarch64)',
    arch_x86_64: 'x86-64',
    step2First: 'If you are installing the game for the first time, use:',
    create: 'Create futari-linux.zip',
    step2Update:
      'If the game is already installed and you only want to update it (the program and the shaders, plus the DLC if you chose it; your <code>futari.toml</code> stays), use:',
    createUpdate: 'Create the update zip',
    step3: '3. Play it on Linux',
    step3Extract:
      'Extract the downloaded zip wherever you keep games, for example <code>~/Games</code>. It makes a <code>futari-linux</code> folder; an update zip is extracted over it.',
    step3Start:
      'Start the game with <code>futari.sh</code> in that folder (from a terminal: <code>~/Games/futari-linux/futari.sh</code>). It runs fullscreen; <code>futari.toml</code> holds the settings.',
    step3Steam:
      'To play from <strong>Steam</strong>, add <code>futari.sh</code> as a non-Steam game (Games &gt; Add a Non-Steam Game to My Library, then Browse). On handhelds, start it from <strong>Game Mode</strong>, so Steam Input gives the game the built-in controller.',
    step3First:
      'The first time you play, new places can <strong>stutter</strong> for a moment while the graphics are prepared; they are kept in the <code>cache</code> folder for the next sessions. The DLC is installed by the game at its first start.',
    checking: 'Checking your game…',
    supported: 'Xbox 360 disc · supported',
    supportedWithDlc: 'Xbox 360 disc + DLC · supported',
    unsupported: 'This version of the game is not supported yet.',
    notGame: 'Not the game',
    noGame: 'The game was not found: choose its disc image, or a folder with default.xex.',
    otherTitle: '{name} is not Mushihimesama Futari.',
    noStreaming: 'this browser window cannot stream downloads. Use a normal (not private) window.',
    downloadStarted: 'Download started ({size}). Keep this page open until it finishes.',
    finished: 'Finished in {seconds} s.',
    error: 'Error: {message}',
    cancelled: 'the download was cancelled',
    readingFiles: 'Reading your game',
    downloadingBuild: 'Downloading the Linux build ({arch})',
    logBuild: 'Supported: Mushihimesama Futari Ver 1.5 for Xbox 360 (build {version}, {arch})',
    logUpdate: 'Update package: the program and the shaders (and the DLC, if you chose it)',
    logDlc: 'DLC: {name}',
    vulkanShaders: "Making the {count} shaders of the Vulkan renderer from the game's executables",
    vulkanReady: 'Shaders ready: they match the tested ones',
    gameIdentical: 'The game files are identical in number and size to the tested copy',
    gameDifferent: 'Warning: the game files differ from the tested copy (modified or damaged files?). The package is made anyway.',
    packing: 'Writing the package',
    done: 'Done: extract the zip, then start futari.sh',
    notSupportedYet: 'this version of the game is not supported yet. Executable fingerprint: {hash}',
    noBuildForArch: 'There is no build for {arch} yet.',
    buildMismatch: 'the downloaded {name} is not the published one ({hash}); try again later',
    vulkanContainers: "the renderer's shaders were not all found in the game's executables ({found} of {wanted}); nothing was written",
    vulkanMismatch: 'the shaders do not match the tested ones ({hash}); nothing was written',
    incompleteGame: 'Incomplete game: {count} of {expected} files. Only the update package can be made.',
    incompleteError: 'the game is incomplete ({count} of {expected} files): choose the whole game',
    downloadFailed: 'could not download {url} ({status})',
  },
  ja: {
    legal:
      '虫姫さまふたりは CAVE Interactive の商標です。アイコンのアートワークは © CAVE です。futari-linux は非公式のファンプロジェクトであり、CAVE、Microsoft とは関係がなく、承認や支援も受けていません。Xbox 360 は Microsoft の商標です。このサイトはゲームデータ、元の実行ファイル、ゲームのシェーダーをホストも配布もしません。あなたのディスクイメージはブラウザ内でのみ読み込まれ、アップロードされることはありません。そのファイルと、そこから作られたシェーダーは、お使いのコンピューターに保存される zip に直接書き込まれます。合法的に入手したご自身のゲームが必要です。',
    sourceCode: 'ソースコード',
    signature: `ChanseyIsTheBest の ${UPSTREAM} を cerroverb が Linux 向けにフォークしたもの`,
    lead:
      'ご自身の <strong>Xbox 360</strong> 版ディスクから、<strong>虫姫さまふたり Ver 1.5</strong> のネイティブ <strong>Linux</strong> 用パッケージを作成します。すべての処理は<strong>このブラウザ内</strong>で行われます。',
    languageBar: '言語',
    step1: '1. ゲームを選ぶ',
    formatPackage: 'ディスクイメージ',
    formatFolder: 'フォルダー',
    ownCopy:
      '<strong>重要：</strong>ご自身のディスクから吸い出した、ご自身のゲームが必要です。インストーラーはそこからゲームを読み込んでパッケージを作成します。これがないと作成できません。パッケージ内のゲームファイルとシェーダーはすべてあなたのコピーから作られ、インストーラーはそれらを一切提供しません。',
    formatHint:
      '<strong>ディスクイメージ：</strong>ゲームの <code>.iso</code>（ディスク全体の吸い出し、または extract-xiso で作り直したイメージ）。<strong>ブラックレーベル</strong>と <strong>Ver1.01</strong> の DLC パッケージファイルも一緒に選べます（本体では ' + DLC_PATH + ' にあります）。' +
      '<strong>フォルダー：</strong>ゲームを展開したフォルダー（<code>default.xex</code> を含むもの）。中にある DLC パッケージファイルや展開済みの DLC フォルダーも見つかります。',
    nothingChosen: 'まだ何も選ばれていません。',
    chosenGame: 'ゲーム：{name}（{size}）',
    chosenDlc: 'DLC：{name}（{size}）',
    chosenNoDlc: 'DLC なし（任意：ブラックレーベル、Ver1.01）',
    step2: '2. パッケージを作成する',
    step2Arch: '遊ぶ Linux 機器のプロセッサー：',
    step2ArchHint:
      'AYN Odin 3 などの ARM 携帯機は <strong>ARM64</strong>、PC、ノートパソコン、Steam Deck、ROG Ally は <strong>x86-64</strong> です。その機器のターミナルで <code>uname -m</code> を実行すると <code>aarch64</code> または <code>x86_64</code> と表示されます。',
    arch_aarch64: 'ARM64（aarch64）',
    arch_x86_64: 'x86-64',
    step2First: '初めてゲームをインストールする場合：',
    create: 'futari-linux.zip を作成',
    step2Update:
      'インストール済みで、更新（プログラムとシェーダー、選んだ場合は DLC も。<code>futari.toml</code> はそのまま残ります）だけを行う場合：',
    createUpdate: '更新用 zip を作成',
    step3: '3. Linux で遊ぶ',
    step3Extract:
      'ダウンロードした zip を、ゲームを置く場所（例：<code>~/Games</code>）に展開します。<code>futari-linux</code> フォルダーができます。更新用 zip はその上に展開します。',
    step3Start:
      'そのフォルダーの <code>futari.sh</code> でゲームを起動します（ターミナルからは <code>~/Games/futari-linux/futari.sh</code>）。フルスクリーンで起動し、設定は <code>futari.toml</code> にあります。',
    step3Steam:
      '<strong>Steam</strong> から遊ぶには、<code>futari.sh</code> を Steam 以外のゲームとして追加します（ゲーム &gt; Steam 以外のゲームをマイライブラリに追加 &gt; 参照）。携帯機では<strong>ゲームモード</strong>から起動してください。Steam Input が内蔵コントローラーをゲームに渡します。',
    step3First:
      '初めてプレイするときは、グラフィックの準備のため、新しい場所で一瞬<strong>カクつく</strong>ことがあります。準備したデータは <code>cache</code> フォルダーに保存され、次回からは使い回されます。DLC は初回起動時にゲームがインストールします。',
    checking: 'ゲームを確認しています…',
    supported: 'Xbox 360 ディスク版 · 対応',
    supportedWithDlc: 'Xbox 360 ディスク版 + DLC · 対応',
    unsupported: 'このバージョンのゲームにはまだ対応していません。',
    notGame: 'ゲームではありません',
    noGame: 'ゲームが見つかりません。ディスクイメージ、または default.xex を含むフォルダーを選んでください。',
    otherTitle: '{name} は虫姫さまふたりではありません。',
    noStreaming: 'このブラウザウィンドウではダウンロードをストリーミングできません。通常の（プライベートではない）ウィンドウを使ってください。',
    downloadStarted: 'ダウンロードを開始しました（{size}）。完了するまでこのページを開いたままにしてください。',
    finished: '{seconds} 秒で完了しました。',
    error: 'エラー：{message}',
    cancelled: 'ダウンロードがキャンセルされました',
    readingFiles: 'ゲームを読み込んでいます',
    downloadingBuild: 'Linux 版（{arch}）をダウンロードしています',
    logBuild: '対応：Xbox 360 版 虫姫さまふたり Ver 1.5（ビルド {version}、{arch}）',
    logUpdate: '更新パッケージ：プログラムとシェーダー（選んだ場合は DLC も）',
    logDlc: 'DLC：{name}',
    vulkanShaders: 'ゲームの実行ファイルから Vulkan レンダラーの {count} 個のシェーダーを作成しています',
    vulkanReady: 'シェーダーの準備ができました（テスト済みのものと一致）',
    gameIdentical: 'ゲームファイルの数とサイズはテスト済みのコピーと同一です',
    gameDifferent: '警告：ゲームファイルがテスト済みのコピーと異なります（改変または破損したファイル？）。パッケージはそのまま作成されます。',
    packing: 'パッケージを書き込んでいます',
    done: '完了：zip を展開して futari.sh を起動してください',
    notSupportedYet: 'このバージョンのゲームにはまだ対応していません。実行ファイルのフィンガープリント：{hash}',
    noBuildForArch: '{arch} 用のビルドはまだありません。',
    buildMismatch: 'ダウンロードした {name} が公開版と一致しません（{hash}）。しばらくしてからもう一度お試しください',
    vulkanContainers: 'レンダラーのシェーダーがゲームの実行ファイルにすべて見つかりません（{wanted} 個中 {found} 個）。何も書き込まれていません',
    vulkanMismatch: 'シェーダーがテスト済みのものと一致しません（{hash}）。何も書き込まれていません',
    incompleteGame: 'ゲームが不完全です：{expected} ファイル中 {count} ファイル。更新パッケージのみ作成できます。',
    incompleteError: 'ゲームが不完全です（{expected} ファイル中 {count} ファイル）。ゲーム全体を選んでください',
    downloadFailed: '{url} をダウンロードできませんでした（{status}）',
  },
};

let current = 'en';

export function getLanguage() {
  return current;
}

export function setLanguage(code) {
  current = TEXTS[code] ? code : 'en';
  return current;
}

// The visitor's choice (saved in their browser), else the browser's language when it is one of ours, else English.
export function preferredLanguage(saved, browser = []) {
  if (saved && TEXTS[saved]) {
    return saved;
  }
  for (const tag of browser) {
    const code = String(tag).toLowerCase().split('-')[0];
    if (TEXTS[code]) {
      return code;
    }
  }
  return 'en';
}

export function t(key, params = {}) {
  const text = TEXTS[current][key] ?? TEXTS.en[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (_, name) => (params[name] ?? `{${name}}`));
}

// Sizes as Windows Explorer shows them, so the page and the file's properties agree: units of 1024 bytes (which
// Windows calls KB, MB and GB) and three significant digits, truncated. 7,834,892,288 bytes is 7.29 GB, not 7.83.
const SIZE_UNITS = {};

export function formatSize(bytes) {
  const units = SIZE_UNITS[current] ?? ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  const decimals = value >= 100 ? 0 : value >= 10 ? 1 : 2;
  const scale = 10 ** decimals;
  // The small epsilon keeps values such as 7.3 from becoming 7.29 through floating point.
  const shown = Math.floor(value * scale + 1e-9) / scale;
  const number = new Intl.NumberFormat(current, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return `${number.format(shown)} ${units[unit]}`;
}
