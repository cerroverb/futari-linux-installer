<div align=center>

<img src="icons/icon-192.png" alt="Mushihimesama Futari" width="20%">

</div>
<h1 align=center>futari-linux installer</h1>

The installer page of [futari-linux](https://github.com/cerroverb/futari-linux), my native Linux build of
Mushihimesama Futari Ver 1.5 (Xbox 360) for ARM64 and x86-64: **https://cerroverb.github.io/futari-linux-installer/**

It is a fork of ChanseyIsTheBest's [futari-nx-installer](https://github.com/ChanseyIsTheBest/futari-nx-installer),
the page that makes the Switch package of [futari-nx](https://github.com/ChanseyIsTheBest/futari-nx). This one makes
the Linux package instead.

You give it your own copy of the game (the disc image, or a folder you extracted it into), with the Black Label and
Ver 1.01 DLC if you have them, pick the processor of the device you will play on, and it gives you a zip with
everything the game needs. Extract it and start `futari.sh`, or add `futari.sh` to Steam as a non-Steam game.
Everything runs in your browser and the game files never leave your computer.

## What it does

1. Finds the game in what you chose, a disc image (`.iso`, read in place through its XDVDFS game partition) or a
   folder with `default.xex`, and the game's DLC packages wherever they are among the chosen files. This is upstream's
   code, unchanged.
2. Identifies the game by the SHA-256 of `default.xex` and picks its build from `release/manifest.json`.
3. Downloads the Linux build for the chosen processor (the executable, its libraries, `futari.sh`, the settings
   template and the licenses) and checks every file's SHA-256.
4. Makes `vulkan_spirv.bin`, the game's shaders for the Linux renderer (Renut on Vulkan). The Linux release carries no
   shader of the game, the same way upstream's Switch NRO carries none, and reads this file beside itself. Futari keeps
   all its shaders inside `default.xex` and the eight game cores of `media/Module`, 42 distinct ones. Each goes through
   upstream's chain up to SPIR-V (`lib/vulkan.js`). Renut's XenosRecomp translates it to HLSL (`wasm/renut_hlsl`), the
   alpha-tested pixel shaders get their early alpha copy (`lib/early_alpha.js`), and DXC compiles it to SPIR-V
   (`wasm/dxc_web`). The deko3d steps after that are left out. The file must match the tested one, whose SHA-256 is
   in `release/manifest.json`.
5. Streams the zip to disk through the service worker, so a whole disc never has to fit in memory. Files keep their
   Unix permissions, so `futari` and `futari.sh` stay executable after extracting.

The zip holds a `futari-linux/` folder with the program, `vulkan_spirv.bin`, the game in `game_root/` and, if you
chose it, the DLC in `dlc/` (the game installs it at its first start). The update zip holds the program, the shaders
and the DLC if you chose it, without `futari.toml`, so extracting it over an installed folder keeps your settings.

## Layout

| Path | Contents |
|---|---|
| `index.html`, `app.js` | The page, its processor choice and its interface (English and Japanese, `lib/i18n.js`) |
| `worker.js` | Builds the package off the main thread |
| `sw.js` | Offline cache and the download stream |
| `lib/` | Disc image reader (XDVDFS), STFS header reader, XEX reader, shader extraction, the Vulkan shaders (`vulkan.js`, with `deko3d.js`'s translation step and `early_alpha.js`), zip writer |
| `wasm/` | WebAssembly builds of Renut's shader translator, DXC and the LZX decoder, as upstream has them |
| `renut_shader_common.h` | Renut's translator's HLSL header (from `app/thirdparty/reblue-XenosRecomp/XenosRecomp`) |
| `release/` | The list of builds |
| `tools/linux_manifest.mjs` | Fills and checks the Linux parts of the list |
| `test/` | Node scripts that run the same code as the page |

## Deployment

The Linux builds are not stored here. They are the `futari-linux-aarch64.tar.gz` and `futari-linux-x86_64.tar.gz`
assets of a release of the futari-linux repository, made there with

```sh
tools/linux/build.sh --release
tools/linux/package.sh --release
```

The workflow in `.github/workflows/deploy.yml` downloads them from the latest release, extracts them into
`release/<arch>/`, checks every file against the list and publishes the page on GitHub Pages. It runs on every push to
`main`, and after publishing a new release it can be run by hand from the Actions tab. Pages must be set to deploy
from GitHub Actions (Settings > Pages > Source).

To publish a new build, list the files of each extracted release folder and pin the shaders the page makes from your
own copy of the game:

```sh
node tools/linux_manifest.mjs files aarch64 futari-linux-aarch64
node tools/linux_manifest.mjs files x86_64 futari-linux-x86_64
node test/vulkan_node.mjs <disc image or game folder> --out vulkan_spirv.bin
node tools/linux_manifest.mjs vulkan vulkan_spirv.bin
```

Test the release build with exactly that `vulkan_spirv.bin` next to it before pushing the list. `vulkan_spirv.bin`
is made from the game, so it is never committed.

## Testing locally

Extract the release folders into `release/aarch64/` and `release/x86_64/` and serve the folder (any static server
works; this one sets the right MIME types):

```sh
python serve.py 8193
```

Then open http://127.0.0.1:8193/. The shader step also runs in Node:

```sh
node test/vulkan_node.mjs <disc image or game folder> [--out vulkan_spirv.bin]
node test/early_alpha_node.mjs <translator HLSL folder> <renut_early_alpha.py's output folder>
node test/texts_node.mjs
```

## License

GPL-3.0 (see [LICENSE](LICENSE)). Third-party components are listed in [NOTICES.md](NOTICES.md). The page is
ChanseyIsTheBest's futari-nx-installer, built on [sa2-nx-installer](https://github.com/ChanseyIsTheBest/sa2-nx-installer)
and [nfsmw-nx-installer](https://github.com/StevensND/nfsmw-nx-installer) by StevensND, with the Linux changes by
cerroverb.

Mushihimesama Futari is a trademark of CAVE Interactive; the icon artwork is © CAVE. This project is not affiliated
with or endorsed by CAVE or Microsoft.
