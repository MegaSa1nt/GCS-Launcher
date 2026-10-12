cmake_minimum_required(VERSION 3.21)

project(launcherfix)

add_library(launcherfix SHARED launcher-fix.cpp patcher.cpp)

target_compile_features(launcherfix PUBLIC cxx_std_20)
set_target_properties(launcherfix PROPERTIES CXX_EXTENSIONS OFF)

include(FetchContent)

FetchContent_Declare(
    fmt
    GIT_REPOSITORY https://github.com/fmtlib/fmt.git
    GIT_TAG 10.2.1
)
FetchContent_MakeAvailable(fmt)

set_target_properties(launcherfix PROPERTIES
    INTERPROCEDURAL_OPTIMIZATION OFF
    UNITY_BUILD ON
    C_VISIBILITY_PRESET hidden
    CXX_VISIBILITY_PRESET hidden
)

target_link_libraries(launcherfix PRIVATE fmt::fmt)
target_link_libraries(launcherfix PRIVATE log)