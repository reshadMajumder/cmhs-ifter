"""Utility to upload ticket fonts to Cloudinary as raw assets.

Usage:
    python scripts/upload_ticket_fonts.py --folder ticket-fonts

Environment:
    CLOUDINARY_URL or cloudinary config env vars must already be set.
"""
from __future__ import annotations

import argparse
import io
import sys
from dataclasses import dataclass

import cloudinary
import cloudinary.uploader
import requests

BASE = "https://raw.githubusercontent.com/google/fonts/main"

FONT_SOURCES = {
    "PlayfairDisplay-Bold": "https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiukDQ.ttf",
    "PlayfairDisplay-Black": "https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKfsukDQ.ttf",
    "PTSans-Regular": "https://fonts.gstatic.com/s/ptsans/v18/jizaRExUiTo99u79P0U.ttf",
    "PTSans-Bold": "https://fonts.gstatic.com/s/ptsans/v18/jizfRExUiTo99u79B_mh4Ok.ttf",
    "CormorantGaramond-Regular": "https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_v86GnM.ttf",
    "CormorantGaramond-Italic": "https://fonts.gstatic.com/s/cormorantgaramond/v21/co3smX5slCNuHLi8bLeY9MK7whWMhyjYrGFEsdtdc62E6zd58jDOjw.ttf",
}


@dataclass
class UploadResult:
    name: str
    public_id: str
    secure_url: str


def download_font(name: str, url: str) -> bytes:
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    return resp.content


def upload_font(font_name: str, data: bytes, folder: str) -> UploadResult:
    file_stream = io.BytesIO(data)
    file_stream.name = f"{font_name}.ttf"
    result = cloudinary.uploader.upload(
        file_stream,
        resource_type="raw",
        folder=folder,
        public_id=font_name,
        overwrite=True,
        use_filename=True,
        unique_filename=False,
    )
    return UploadResult(name=font_name, public_id=result["public_id"], secure_url=result["secure_url"])


def main() -> int:
    parser = argparse.ArgumentParser(description="Upload ticket fonts to Cloudinary.")
    parser.add_argument("--folder", required=True, help="Cloudinary folder to store fonts (e.g. ticket-fonts)")
    args = parser.parse_args()

    folder = args.folder.strip("/")
    uploads: list[UploadResult] = []
    for font_name, url in FONT_SOURCES.items():
        try:
            print(f"Downloading {font_name} ...", flush=True)
            data = download_font(font_name, url)
            print(f"Uploading {font_name} -> {folder} ...", flush=True)
            result = upload_font(font_name, data, folder)
            uploads.append(result)
        except Exception as exc:  # noqa: BLE001
            print(f"ERROR: failed to upload {font_name}: {exc}", file=sys.stderr)
            return 1

    base_url = uploads[0].secure_url.rsplit('/', 1)[0] if uploads else 'N/A'
    print("\nUploaded fonts:")
    for result in uploads:
        print(f" - {result.name}: {result.secure_url}")
    print(f"\nSet TICKET_FONT_BASE_URL to: {base_url}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
