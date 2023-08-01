#!/bin/sh

set -e

BUILD_TYPE=${1:-"Release"}
DIR="$BUILD_TYPE"
if [ -n "$2" ]; then
  DIR="$DIR-$2"
fi

CXX="$(command -v g++-13 | xargs realpath)"
CMAKE_TOOLCHAIN_FILE="$(dirname "$(command -v vcpkg | xargs realpath)")/scripts/buildsystems/vcpkg.cmake"

if [ "$2" = "WASM" ]; then
  (
    EMTOOLCHAIN="$(dirname "$(command -v em++ | xargs realpath)")/cmake/Modules/Platform/Emscripten.cmake"
    mkdir -p "$DIR" && cd "$DIR" || exit
    cmake .. -DCXX="$CXX" -DCMAKE_BUILD_TYPE="$BUILD_TYPE" \
      -DCMAKE_TOOLCHAIN_FILE="$CMAKE_TOOLCHAIN_FILE" \
      -DVCPKG_CHAINLOAD_TOOLCHAIN_FILE="$EMTOOLCHAIN" \
      -DVCPKG_TARGET_TRIPLET=wasm32-emscripten
    make
  )
else
  (
    mkdir -p "$DIR" && cd "$DIR" || exit
    cmake .. -DCXX="$CXX" -DCMAKE_BUILD_TYPE="$BUILD_TYPE" \
      -DCMAKE_TOOLCHAIN_FILE="$CMAKE_TOOLCHAIN_FILE"
    make
  )
  ln -s "$DIR/compile_commands.json" .
fi
