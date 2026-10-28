# Third-party notices

| Component | Where | License |
|---|---|---|
| [nfsmw-nx-installer](https://github.com/StevensND/nfsmw-nx-installer) by StevensND (commit `e7ec1b65`): the page's structure and style, the service worker (`sw.js`), the worker's download stream, the XEX reader (`lib/xex.js`), the zip writer (`lib/zip.js`), the language picker and its flags | `sw.js`, `worker.js`, `app.js`, `index.html`, `lib/` | GPL-3.0 |
| [DirectXShaderCompiler](https://github.com/microsoft/DirectXShaderCompiler) v2025.1 (commit `75a029d95`), unmodified, with its bundled SPIRV-Tools and SPIRV-Headers, and the `dxc_web.cpp` wrapper, as built by nfsmw-nx-installer | `wasm/dxc_web.*` | University of Illinois/NCSA Open Source License (LLVM); SPIRV-Tools: Apache-2.0; SPIRV-Headers: MIT; the wrapper: GPL-3.0 |
| [libmspack](https://www.cabextract.org.uk/libmspack/) by Stuart Caie (LZX decoder) | `wasm/lzx.*` | LGPL-2.1 |
| [fmt](https://github.com/fmtlib/fmt) | `wasm/renut_hlsl.*` | MIT |
| [xxHash](https://github.com/Cyan4973/xxHash) by Yann Collet | `wasm/renut_hlsl.*` | BSD-2-Clause |
| [futari-nx-installer](https://github.com/ChanseyIsTheBest/futari-nx-installer) by ChanseyIsTheBest (commit `9e5efc2`): this page, which futari-linux-installer forks (everything except the Linux changes: `lib/vulkan.js`, `tools/linux_manifest.mjs`, the processor choice, the Linux package and texts) | everything | GPL-3.0 |
| [sa2-nx-installer](https://github.com/ChanseyIsTheBest/sa2-nx-installer) by ChanseyIsTheBest: this page's starting point (the page, the worker, the STFS and XEX readers, the shader library steps, the tests) | everything | GPL-3.0 |
| [Emscripten](https://emscripten.org) runtime | `wasm/*.mjs` | MIT and the University of Illinois/NCSA Open Source License |
| Renut's XenosRecomp ([reNut](https://github.com/masterspike52/reNut) by reNut and masterspike52: reblue-XenosRecomp, from hedge-dev's XenosRecomp, with banjo-nx's and futari-nx's changes) and the translator front end of peggle2-nx (`tools/renut_hlsl_frontend.cpp`, in futari-nx) | `wasm/renut_hlsl.*`, `renut_shader_common.h` | MIT (the translator); GPL-3.0 (the front end) |
| The deko3d shader chain of [peggle2-nx-installer](https://github.com/ChanseyIsTheBest/peggle2-nx-installer) and futari-nx's early alpha step (banjo-nx's `tools/early_alpha.py` with `tools/renut_early_alpha.py`, in JavaScript); the Linux page uses its translation step and the early alpha step | `lib/deko3d.js`, `lib/deko3d_glsl.js`, `lib/deko3d_package.js`, `lib/early_alpha.js`, `wasm/src/deko3d/` | GPL-3.0 |

`wasm/lzx.*` is built from the futari-nx repository with `shaders/wasm/build_wasm_tools.sh` (Emscripten 6.0.11). libmspack is covered by the GNU Lesser General Public License
2.1: `wasm/lzx.wasm` is built from the unmodified libmspack sources (`lzxd.c` and `system.c`, at the commit pinned by
ReXGlue SDK v0.10.0, in `sdk/thirdparty/libmspack` of futari-nx) and `shaders/wasm/futari_lzx.cpp` of futari-nx. With those
sources it can be rebuilt and replaced by a modified version.

The licenses of the software in the package (the Linux program and its libraries) are its `LICENSE` and
`THIRD_PARTY_NOTICES.md`, and the source code with its license is at https://github.com/cerroverb/futari-linux.

The icon is cropped from the Mushihimesama Futari cover artwork, © CAVE.
