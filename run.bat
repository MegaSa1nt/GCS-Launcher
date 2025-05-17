@echo off

set /A NUMBER=0

echo Hi! That's GCS-Launcher, your GDPS launcher
echo.
echo 1: Start development build on your computer
echo 2: Build launcher
echo 3: Open Android Studio with launcher's project
echo.
:restart
set /P NUMBER="Your choice: "

set /A NUMBER+=0
if %NUMBER% EQU 1 (
	npm run tauri android dev -- --host
)
if %NUMBER% EQU 2 (
	npm run tauri android build -- --target aarch64 --target armv7
) 
if %NUMBER% EQU 3 (
	npm run tauri android dev -- --open --host
) else (
	goto :wrong
)

:wrong
echo Wrong answer!
goto :restart