"""临时脚本：将 updatedetail.pdf 抽取为文本，便于分析。完成后将被删除。"""
import sys
from pathlib import Path

PDF_PATH = Path(__file__).parent / "updatedetail.pdf"
OUT_PATH = Path(__file__).parent / "_updatedetail.txt"


def try_pdfplumber():
    try:
        import pdfplumber
    except Exception as e:
        return None, f"pdfplumber import failed: {e}"
    try:
        parts = []
        with pdfplumber.open(str(PDF_PATH)) as pdf:
            for i, page in enumerate(pdf.pages, 1):
                parts.append(f"\n===== PAGE {i} / {len(pdf.pages)} =====\n")
                text = page.extract_text() or ""
                parts.append(text)
        return "".join(parts), None
    except Exception as e:
        return None, f"pdfplumber extract failed: {e}"


def try_pypdf():
    try:
        from pypdf import PdfReader
    except Exception as e:
        return None, f"pypdf import failed: {e}"
    try:
        r = PdfReader(str(PDF_PATH))
        parts = []
        for i, p in enumerate(r.pages, 1):
            parts.append(f"\n===== PAGE {i} / {len(r.pages)} =====\n")
            parts.append(p.extract_text() or "")
        return "".join(parts), None
    except Exception as e:
        return None, f"pypdf extract failed: {e}"


def main():
    text, err = try_pdfplumber()
    if text is None:
        print("[WARN]", err)
        text, err = try_pypdf()
    if text is None:
        print("[ERROR]", err)
        sys.exit(2)
    OUT_PATH.write_text(text, encoding="utf-8")
    print("OK wrote", OUT_PATH, "chars=", len(text))


if __name__ == "__main__":
    main()
