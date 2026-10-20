"""
Encuadra las fotos de las poleras para que todas se vean del mismo tamaño.

Uso:  python encuadrar.py            (lo corre publicar.bat antes de subir)
      python encuadrar.py --probar   (solo muestra qué haría, sin tocar nada)

Qué hace con cada foto de products.json:
- Si la polera está sobre un fondo liso (blanco o casi blanco), la recorta, la deja
  ocupando el mismo porcentaje del cuadro en todas las fotos, la centra y la guarda
  cuadrada (en img/ y en img/min/).
- Las fotos de detalle, las de fondo con textura y las que tienen la polera cortada
  por el borde no se tocan.
- Cada foto se procesa una sola vez: quedan anotadas en encuadradas.json.

Necesita Pillow:  python -m pip install pillow
"""
import json
import sys
from pathlib import Path

try:
    from PIL import Image, ImageChops, ImageFilter
except ImportError:
    print("encuadrar.py: falta Pillow. Instálalo con:  python -m pip install pillow")
    sys.exit(0)

RAIZ = Path(__file__).parent
IMG, MIN = RAIZ / "img", RAIZ / "img" / "min"
REGISTRO = RAIZ / "encuadradas.json"
OCUPA = 0.84        # la polera ocupa el 84 % del lado del cuadro
LADO_MIN = 500      # lado de las miniaturas
UMBRAL = 14         # diferencia con el fondo para considerar que un píxel es polera
FONDO_LISO = 0.96   # % del borde que debe ser del color del fondo


def borde(im, ancho=4):
    w, h = im.size
    px = im.load()
    for x in range(0, w, 3):
        for y in list(range(ancho)) + list(range(h - ancho, h)):
            yield px[x, y]
    for y in range(0, h, 3):
        for x in list(range(ancho)) + list(range(w - ancho, w)):
            yield px[x, y]


def tramo_mayor(valores, minimo):
    """El tramo continuo más largo de valores por sobre "minimo": (inicio, fin) o None."""
    mejor, inicio = None, None
    for i, v in enumerate(list(valores) + [0]):
        if v > minimo and inicio is None:
            inicio = i
        elif v <= minimo and inicio is not None:
            if not mejor or i - inicio > mejor[1] - mejor[0]:
                mejor = (inicio, i)
            inicio = None
    return mejor


def caja_principal(mascara, n=300):
    """Caja de la polera: el bloque continuo más grande de la máscara (ignora marcas de agua y manchas)."""
    w, h = mascara.size
    chica = mascara.resize((n, n), Image.BOX)
    px = chica.load()
    columnas = [sum(px[x, y] for y in range(n)) / (255 * n) for x in range(n)]
    cx = tramo_mayor(columnas, 0.03)
    if not cx:
        return None
    filas = [sum(px[x, y] for x in range(cx[0], cx[1])) / (255 * (cx[1] - cx[0])) for y in range(n)]
    cy = tramo_mayor(filas, 0.03)
    if not cy:
        return None
    return (cx[0] * w // n, cy[0] * h // n, cx[1] * w // n, cy[1] * h // n)


def analizar(im):
    """Devuelve (color de fondo, caja de la polera) o None si la foto no se debe tocar."""
    pixeles = list(borde(im))
    fondo = tuple(sorted(p[i] for p in pixeles)[len(pixeles) // 2] for i in range(3))
    if min(fondo) < 200:  # fondo oscuro o de color: probablemente una foto de detalle
        return None
    parecidos = sum(1 for p in pixeles if max(abs(p[i] - fondo[i]) for i in range(3)) <= 18)
    if parecidos / len(pixeles) < FONDO_LISO:
        return None
    # Umbral según el ruido del fondo: un blanco puro permite detectar hasta el borde suave de una polera blanca
    ruido = sorted(max(abs(p[i] - fondo[i]) for i in range(3)) for p in pixeles)[int(len(pixeles) * 0.95)]
    umbral = max(5, min(UMBRAL, ruido + 3))
    dif = ImageChops.difference(im, Image.new("RGB", im.size, fondo)).convert("L")
    mascara = dif.point(lambda v: 255 if v > umbral else 0).filter(ImageFilter.MedianFilter(5))
    w, h = im.size
    caja = caja_principal(mascara)
    if not caja:
        return None
    margen = 0.01
    toca = sum([caja[0] <= w * margen, caja[1] <= h * margen, caja[2] >= w * (1 - margen), caja[3] >= h * (1 - margen)])
    if toca >= 2:  # la polera llega al borde: está cortada o es un acercamiento
        return None
    return fondo, caja


def encuadrar(ruta):
    im = Image.open(ruta).convert("RGB")
    res = analizar(im)
    if not res:
        return None
    fondo, (x0, y0, x1, y1) = res
    lado = max(im.size)
    bw, bh = x1 - x0, y1 - y0
    escala = OCUPA * lado / max(bw, bh)
    polera = im.crop((x0, y0, x1, y1)).resize((max(1, round(bw * escala)), max(1, round(bh * escala))), Image.LANCZOS)
    lienzo = Image.new("RGB", (lado, lado), fondo)
    lienzo.paste(polera, ((lado - polera.width) // 2, (lado - polera.height) // 2))
    return lienzo, max(bw / im.size[0], bh / im.size[1])


def main():
    probar = "--probar" in sys.argv
    sys.stdout.reconfigure(encoding="utf-8")
    hechas = set(json.loads(REGISTRO.read_text(encoding="utf-8"))) if REGISTRO.exists() else set()
    productos = json.loads((RAIZ / "products.json").read_text(encoding="utf-8"))
    rutas = []
    for p in productos:
        for v in p.get("variantes") or [{"imagenes": p.get("imagenes", [])}]:
            rutas += v.get("imagenes", [])
    rutas = list(dict.fromkeys(rutas))
    nuevas = cambiadas = 0
    for r in rutas:
        nombre = Path(r).name
        if nombre in hechas or not (IMG / nombre).exists():
            continue
        nuevas += 1
        resultado = encuadrar(IMG / nombre)
        if resultado:
            lienzo, antes = resultado
            cambiadas += 1
            print(f"  encuadrada  {nombre}  (antes ocupaba {antes:.0%})")
            if not probar:
                lienzo.save(IMG / nombre, "WEBP", quality=88, method=6)
                lienzo.resize((LADO_MIN, LADO_MIN), Image.LANCZOS).save(MIN / nombre, "WEBP", quality=82, method=6)
        if not probar:
            hechas.add(nombre)
    if not probar:
        REGISTRO.write_text(json.dumps(sorted(hechas), ensure_ascii=False, indent=0) + "\n", encoding="utf-8")
    print(f"encuadrar.py: {nuevas} fotos revisadas, {cambiadas} encuadradas" + (" (prueba, sin guardar)" if probar else ""))


if __name__ == "__main__":
    main()
