@echo off
rem Doble clic para subir los cambios al sitio publicado (Cloudflare) y guardar una copia en GitHub
cd /d "%~dp0"
python -c "import PIL" 2>nul || python -m pip install --quiet pillow
python extraer.py
python encuadrar.py
python armar_sitio.py
git add -A
git commit -m "Actualiza catalogo"
git push
cd pagos\sitio
call npx --yes wrangler deploy
cd /d "%~dp0"
pause
