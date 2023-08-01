enable_testing()

find_package(GTest CONFIG REQUIRED)

add_executable(runTests lib/standing_waves_test.cpp)
target_link_libraries(runTests GTest::gtest GTest::gtest_main pthread standing_waves matching_pursuit)

add_test(runTests runTests)
