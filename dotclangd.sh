#!/bin/sh

echo "CompileFlags:" > .clangd
echo "  Add:" >> .clangd
EMSCRIPTEN_INCLUDE="$(dirname "$(command -v em++ | xargs realpath)")/system/include"
echo "    - '-I${EMSCRIPTEN_INCLUDE}'" >> .clangd
