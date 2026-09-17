@echo off
title Vendora - Supplier Intelligence System
color 0B
cls
echo ===================================================================
echo               VENDORA - SUPPLIER INTELLIGENCE SYSTEM
echo ===================================================================
echo [i] Starting local database engine on your laptop...
echo [i] 100%% Local - No Internet or Cloud server required!
echo [i] Opening browser automatically at http://localhost:3000 ...
echo ===================================================================

cd /d "E:\Antigravity\Vendora"
start "" "http://localhost:3000"
"C:\Program Files\nodejs\node.exe" server.js

pause
