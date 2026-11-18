@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Sistema LigorioTec

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo O Node.js nao foi encontrado neste computador.
  echo Instale a versao LTS em https://nodejs.org e rode este arquivo de novo.
  echo.
  pause
  exit /b 1
)

echo Node encontrado:
node -v
echo.

set PRECISA_INSTALAR=0
if not exist "node_modules\next" set PRECISA_INSTALAR=1
rem versao do Next.js mudou (atualizacao de seguranca): reinstala os pacotes
if exist "node_modules\next" node -e "process.exit(require('./node_modules/next/package.json').version.startsWith('15.')?0:1)" || set PRECISA_INSTALAR=1
if "%PRECISA_INSTALAR%"=="1" (
  echo Instalando os pacotes. Pode demorar alguns minutos...
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo A instalacao falhou. Tire um print desta janela e mande no chat.
    echo.
    pause
    exit /b 1
  )
)

echo.
echo Abrindo o sistema em http://localhost:3005
echo Para desligar, feche esta janela.
echo.
start "" cmd /c "timeout /t 8 >nul & start http://localhost:3005"
call npm run dev -- -p 3005

echo.
echo O sistema parou. Se apareceu algum erro acima, tire um print e mande no chat.
pause
