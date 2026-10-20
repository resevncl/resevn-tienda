"""
Arma la carpeta .sitio/ con SOLO los archivos públicos de la tienda, para subirla a Cloudflare Pages.
Toma los archivos que están en git y deja fuera los de trabajo (programas, listas internas, etc.).
Uso: python armar_sitio.py   (lo corre publicar.bat)
"""
import shutil, subprocess
from pathlib import Path

RAIZ = Path(__file__).parent
DESTINO = RAIZ / ".sitio"
FUERA = {".gitignore", ".nojekyll", "CNAME", "ajustes.json", "encuadradas.json", "encuadrar.py",
         "extraer.py", "armar_sitio.py", "publicar.bat"}

archivos = subprocess.run(["git", "ls-files"], cwd=RAIZ, capture_output=True, text=True, check=True).stdout.splitlines()
archivos += subprocess.run(["git", "ls-files", "--others", "--exclude-standard"], cwd=RAIZ, capture_output=True, text=True, check=True).stdout.splitlines()
if DESTINO.exists():
    shutil.rmtree(DESTINO)
n = 0
for a in sorted(set(archivos)):
    if a in FUERA or a.endswith(".py") or a.endswith(".bat") or not (RAIZ / a).is_file():
        continue
    destino = DESTINO / a
    destino.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(RAIZ / a, destino)
    n += 1
print(f"Sitio armado en .sitio/ con {n} archivos")
