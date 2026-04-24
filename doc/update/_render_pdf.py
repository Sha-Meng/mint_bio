"""临时脚本：把 updatedetail.pdf 每一页切成多块 PNG，便于多模态分片读取。

输出结构：
 - _pages/page_XX_qY.png  每页按 2x2 切成 4 块，zoom=1.4，保证字符清晰又不超大
"""
from pathlib import Path
import fitz  # PyMuPDF

HERE = Path(__file__).parent
PDF = HERE / "updatedetail.pdf"
OUT_DIR = HERE / "_pages"
OUT_DIR.mkdir(exist_ok=True)

# 清空旧文件，避免混淆
for old in OUT_DIR.glob("*.png"):
    old.unlink()

doc = fitz.open(str(PDF))
zoom = 1.4
mat = fitz.Matrix(zoom, zoom)
cols, rows = 2, 3  # 每页按 2 列 x 3 行 = 6 块切分
for i, page in enumerate(doc, 1):
    rect = page.rect
    w = rect.width
    h = rect.height
    cw = w / cols
    rh = h / rows
    for r in range(rows):
        for c in range(cols):
            clip = fitz.Rect(
                rect.x0 + c * cw,
                rect.y0 + r * rh,
                rect.x0 + (c + 1) * cw,
                rect.y0 + (r + 1) * rh,
            )
            pix = page.get_pixmap(matrix=mat, clip=clip)
            q = r * cols + c + 1
            out = OUT_DIR / f"page_{i:02d}_q{q}.png"
            pix.save(str(out))
            print(f"saved {out} ({pix.width}x{pix.height})")
doc.close()
