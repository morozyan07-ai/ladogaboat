@echo off
cd /d "%~dp0"

echo === Ladoga Boat Git Push Fix ===
echo.

echo Removing stale git lock files...
if exist ".git\HEAD.lock" del /f ".git\HEAD.lock" && echo  HEAD.lock removed
if exist ".git\index.lock" del /f ".git\index.lock" && echo  index.lock removed
if exist ".git\objects\maintenance.lock" del /f ".git\objects\maintenance.lock" && echo  maintenance.lock removed
echo.

echo Current git status:
git log --oneline -3
echo.
git status --short
echo.

echo Pushing to GitHub...
git push origin main
echo.

if %ERRORLEVEL% EQU 0 (
    echo === PUSH SUCCESSFUL! CI will deploy in ~2 minutes ===
    echo Check: https://github.com/morozyan07-ai/ladogaboat/actions
) else (
    echo === PUSH FAILED - check error above ===
)
echo.
pause
