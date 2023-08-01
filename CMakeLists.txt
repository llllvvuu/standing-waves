option(BUILD_TESTS "Build tests" ON)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_FLAGS "-Wall -Wextra")
set(CMAKE_CXX_FLAGS_DEBUG "-g")
set(CMAKE_CXX_FLAGS_RELEASE "-O3")

cmake_minimum_required(VERSION 3.10)
project(standing_waves)

include_directories(${CMAKE_SOURCE_DIR}/vendor/eigen)
include_directories(${CMAKE_SOURCE_DIR}/vendor/spectra/include)

add_subdirectory (src)
if(BUILD_TESTS)
  add_subdirectory (test)
  enable_testing ()
  add_test (NAME Tests COMMAND runTests)
endif()
