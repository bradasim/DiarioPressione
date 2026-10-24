@echo off
title Diario Pressione Arteriosa
echo ===================================================
echo   Avvio del Diario Pressione Arteriosa su server locale
echo   Apertura del browser su http://localhost:8000/Index.html
echo ===================================================
timeout /t 1 /nobreak >nul
start http://localhost:8000/Index.html
python -m http.server 8000
