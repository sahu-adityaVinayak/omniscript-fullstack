@echo off
setlocal

set ROOT=%~dp0
set BACKEND=%ROOT%backend
set FRONTEND=%ROOT%frontend
set PYTHON_EXE=%ROOT%.venv\Scripts\python.exe

if not exist "%BACKEND%" (
  echo [ERROR] Backend folder not found: %BACKEND%
  pause
  exit /b 1
)

if not exist "%FRONTEND%" (
  echo [ERROR] Frontend folder not found: %FRONTEND%
  pause
  exit /b 1
)

if not exist "%PYTHON_EXE%" (
  echo [ERROR] Python executable not found: %PYTHON_EXE%
  echo Please create/activate your virtual environment first.
  pause
  exit /b 1
)

if not exist "%FRONTEND%\.env.local" (
  if exist "%FRONTEND%\.env.example" (
    copy /Y "%FRONTEND%\.env.example" "%FRONTEND%\.env.local" > nul
    echo [INFO] Created frontend .env.local from .env.example
  )
)

if not exist "%BACKEND%\.env" (
  if exist "%BACKEND%\.env.example" (
    copy /Y "%BACKEND%\.env.example" "%BACKEND%\.env" > nul
    echo [INFO] Created backend .env from .env.example
  )
)

start "OmniScript Backend" cmd /k "cd /d "%BACKEND%" && "%PYTHON_EXE%" -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
start "OmniScript Frontend" cmd /k "cd /d "%FRONTEND%" && npm.cmd run dev"

echo.
echo Started both servers:
echo - Backend:  http://127.0.0.1:8000
echo - Frontend: http://localhost:3000
echo.
echo You can close this window now.
endlocal
