@echo off
echo ==========================================
echo        MedAI Doctor - Backend Server
echo ==========================================
echo.
cd /d "%~dp0"

REM Check if venv exists
if not exist "venv\Scripts\activate.bat" (
    echo [SETUP] Creating virtual environment...
    python -m venv venv
)

REM Activate venv
call venv\Scripts\activate.bat

REM Install / upgrade requirements
echo [SETUP] Installing requirements...
pip install -r ..\requirements.txt -q

echo.
echo [START] Starting FastAPI server on http://127.0.0.1:8000
echo [INFO]  Press Ctrl+C to stop
echo [INFO]  Health check: http://127.0.0.1:8000/api/health
echo.
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000

pause
