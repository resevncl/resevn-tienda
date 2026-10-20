@echo off
rem Doble clic para subir los cambios al sitio publicado
cd /d "%~dp0"
python -c "import PIL" 2>nul || python -m pip install --quiet pillow
python extraer.py
python encuadrar.py
git add -A
git commit -m "Actualiza catalogo"
git push
pause
