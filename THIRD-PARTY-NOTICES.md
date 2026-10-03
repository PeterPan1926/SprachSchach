# Third-party notices

## Stockfish.js 17.1 Full Single Thread
Copyright (c) 2025 Chess.com, LLC and Stockfish contributors.
GPLv3: see LICENSE and app/src/main/assets/STOCKFISH-LICENSE.txt.
https://github.com/nmrugg/stockfish.js/tree/v17.1.0
Files stockfish-17.1-single-a496a04.js and stockfish-17.1-single-a496a04-part-0.wasm through -part-5.wasm are unmodified. This is the full NNUE build (not Lite), using one CPU thread.
Corresponding source: distributed separately as Stockfish-17.1-Quellcode.zip.
Build instructions are in that archive (README.md and build.js). App code is provided in SprachSchach-Quellcode.zip.

## chess.js 1.4.0
Copyright (c) 2025 Jeff Hlywa.
BSD-2-Clause: see app/src/main/assets/CHESS-LICENSE.txt.
https://github.com/jhlywa/chess.js

## Merida chess pieces (Android and Safari/iPad Web)
Merida chess pieces
Copyright: Armando Hernandez Marroquin
License: GNU General Public License, version 2 or later (GPL-2.0-or-later).
Distributed with this GPL-3.0 application; see LICENSE.
Source: https://github.com/lichess-org/lila/tree/b150e39fad24e4a2d4764cc3bab2ec7f186ae8aa/public/piece/merida
Upstream license attribution: COPYING.md in that revision.
Original SVG files: ipad-web/merida/ in the accompanying application source.
merida.js bundles those SVG files without changing their artwork.
Rendering gives gradient IDs unique names and sizes pawns slightly smaller.

## Local MM VI / MAME 0.289
The Android APK includes a native headless MAME 0.289 executable for ARM64 and x86_64.
MAME is distributed under GPL-2.0. Our headless interface is GPL-2.0-or-later.
MAME runs as a separate executable communicating through UCI pipes; the app is GPL-3.0.
Individual MAME files use the licenses stated in their source headers, including BSD-3-Clause.
Full upstream COPYING: app/src/main/assets/MAME-LICENSE.txt; GPL text and
component license texts: app/src/main/assets/mame-legal/.
Corresponding upstream source: https://github.com/mamedev/mame/archive/refs/tags/mame0289.zip
SHA256: 31e8af15a98694cb42dda5be054720cd277348946c68aba8ee2778c7ab78b98a
Our complete headless platform source and build modifications: native/mmvi/ (included in app source).
Build details: native/mmvi/README.md. No external MAME patches are required.

The supplied Mephisto MM VI bridge from SprachSchach-MMVI-Update-1.1.6.zip
includes the MessNew-UCI MAME plugin, licensed BSD-3-Clause;
see bridge/plugins/chessengine/LICENSE for copyright and full terms.
This plugin and MAME plugins/boot.lua are included in assets/mmvi-runtime.zip.
The user's supplied MM VI device ROM and gk2000.svg display data are included in this
private APK to enable local emulation. Device firmware is not covered by the app's GPL
and is not offered as open-source software. Do not publicly redistribute firmware
without the rights holder's authorization.

### MM VI artwork and confirmation sample (Android 1.26)

`assets/mmvi/mephisto_mm6.lay` is the original MAME 0.289 internal layout,
CC0-1.0, copyright holders Sandro Ronco and hap; thanks to Franz Huber.
The Android board/module view adapts its palette and key/display arrangement,
omitting MAME's debugging sensor toolbar. `display.svg` preserves the provided
gk2000 SVG paths with segment attributes and LCD background styling.
`confirmation.wav` is sampled from the supplied MM VI ROM's digital P6.0
DAC transitions after the first legal human move; provenance and transitions
are in `tone-source.json`. This is not a microphone recording of physical hardware.
The ROM-related material retains its existing private-use provenance.

### Original hardware controls (Android 1.28)

`bridge/plugins/chessengine/hardware.lua` extends the BSD-3-Clause chessengine
plugin with raw MM VI inputs and sensorboard/state helpers. It forwards the
original MAME driver's keypad masks; the user's ROM implements all menus.
Live P6.0 DAC transitions drive Android audio independently from speech output.
No replacement menu implementation or new native MAME binary is introduced.

Android 1.31 additional modules: MAME 0.289 original modular.cpp and polgar.cpp
CPU/device emulation; the uploaded polg_101.bin matches Polgar 10 MHz (v10.1),
not ordinary 4.9 MHz Polgar 1.01. User-provided chess ROMs and Vancouver artwork
are included for the requested personal local emulation. Program ROM bytes unchanged.
Polgar panel colours/layout derive from MAME mephisto_polgar.lay (CC0, Sandro Ronco/hap).
The supplied polgar101.lay refers to an absent external Boards/polgar10.png;
that absent image is not bundled. Original controls/native LCD remain functional.

The separate HD44780 character-generator font uses MIT-licensed fontA00 from
vrEmuLcd, Copyright 2020 Troy Schrapel:
https://github.com/visrealm/vrEmuLcd/blob/main/src/vrEmuLcd.c
Source, deterministic conversion, font and MIT license: native/mmvi/lcd-font/.
Android asset MEPHISTO-LCD-FONT-LICENSE.txt carries the license.
This compatible character font replaces only the missing external LCD CGROM;
it does not replace chess program ROMs or firmware-generated CGRAM symbols.

chessengine Polgar adapter derives from Sandro Ronco's BSD-3-Clause adapter:
https://github.com/sronco/mame-chessengine/blob/master/chessengine/interfaces/polgar.lua
Vancouver promotion handling derives from alm32.lua in the same repository.
License: bridge/plugins/chessengine/LICENSE.

Android 1.32: assets/polgar/original-layout.svg is compiled from the original
MAME mephisto_polgar.lay (CC0-1.0, Sandro Ronco and hap). The converter
native/mmvi/artwork/generate.py preserves static positions, labels and icons.
Original MAME artwork/chess white SVG icons are included for module key symbols.
The separately supplied polgar101.lay still requires absent Boards/polgar10.png
for its external photographic view; that missing photograph is not substituted
with an invented photographic image. Both app views use the supplied Vancouver
image with original display/key overlays; native LCD font bit order is corrected.

Android 1.33: the subsequently supplied polgar10.png is included unchanged for
the requested personal local emulation. Both Polgar views now use this actual
photograph; interactive keys/status lights are aligned with the supplied
polgar101.lay and the photograph. Original ROMs and native emulation unchanged.

Web 1.2.0: local WebAssembly port of the same MAME 0.289 module emulation.
Browser-specific patches, original headless platform adapter, build instructions
and ROM/LCD/font provenance are included in native/web and native/mmvi.
The JS worker replaces only console input/output and native filesystem storage;
program ROMs are unchanged. Native module states use IndexedDB in this profile.
Emscripten runtime is MIT/NCSA; see https://github.com/emscripten-core/emscripten/blob/3.1.69/LICENSE.
The current browser build includes the user-supplied Vancouver and Polgar photos.
