@echo off

set /A NUMBER=0

echo Hi! That's GCS-Launcher, your GDPS launcher
echo.
echo 1: Start dev build
echo 2: Build launcher
echo.
:restart
set /P NUMBER="Your choice: "

set /A NUMBER+=0
if %NUMBER% EQU 1 (
	npm run tauri dev
)
if %NUMBER% EQU 2 (
	npm run tauri build
) else (
	goto :wrong
)

:wrong
echo Wrong answer!
goto :restart