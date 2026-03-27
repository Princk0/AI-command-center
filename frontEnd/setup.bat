@echo off
echo ================================================
echo   RUTZ - Frontend Setup
echo ================================================
echo.

REM Create directory structure
mkdir src\components 2>nul
mkdir src\hooks 2>nul
mkdir src\utils 2>nul

REM Create .env file (Windows can't easily create dotfiles)
echo VITE_MOCK_MODE=true> .env
echo VITE_BACKEND_URL=http://localhost:8000>> .env
echo VITE_WS_URL=ws://localhost:8000/ws>> .env
echo Created .env file

REM Install dependencies
echo.
echo Installing dependencies...
call npm install

echo.
echo ================================================
echo   Setup complete! Run: npm run dev
echo   Then open: http://localhost:5173
echo ================================================
pause
