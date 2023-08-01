add_library(standing_waves STATIC lib/standing_waves.cpp)
add_library(matching_pursuit STATIC lib/matching_pursuit.cpp)
add_executable(standing_waves_cli cli/main.cpp)
target_link_libraries(standing_waves_cli standing_waves)

if(EMSCRIPTEN)
    set(CMAKE_EXECUTABLE_SUFFIX ".js")  # .js instead of .wasm
    add_executable(standing_waves_em emscripten.cpp)
    target_link_libraries(standing_waves_em standing_waves matching_pursuit)

    set_target_properties(standing_waves_em PROPERTIES COMPILE_FLAGS "-s WASM=1 -s ALLOW_MEMORY_GROWTH=1 --bind")
    set_target_properties(standing_waves_em PROPERTIES LINK_FLAGS "-s WASM=1 -s ALLOW_MEMORY_GROWTH=1 --bind")
endif()
