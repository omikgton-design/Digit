import re
from typing import Any

# Байгууллагын регистр: 7–10 тэмдэгт (тоо, үсэг). Том үсгээр хадгална.
REGISTER_PATTERN = re.compile(r"^[0-9A-ZА-ЯЁӨҮ]{7,10}$")


def normalize_register(value: Any) -> str:
    """Регистрийн дугаарыг зайгүй, том үсэгтэй болгоно."""
    return re.sub(r"\s+", "", str(value or "")).upper()
