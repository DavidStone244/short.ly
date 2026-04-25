"""Base62 encoding utilities for generating short codes from integer IDs.

Base62 produces compact, URL-safe identifiers using [0-9A-Za-z]. Encoding the
auto-increment primary key of a link gives us collision-free short codes
without needing to retry on conflicts. We add a configurable offset to the
ID so that the first generated code is at least N characters long, making
short.ly URLs look uniform from day one.
"""

from __future__ import annotations

ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
BASE = len(ALPHABET)
_INDEX = {c: i for i, c in enumerate(ALPHABET)}


def encode(num: int) -> str:
    """Encode a non-negative integer as a Base62 string."""
    if num < 0:
        raise ValueError("Cannot encode a negative integer")
    if num == 0:
        return ALPHABET[0]
    chars: list[str] = []
    while num > 0:
        num, rem = divmod(num, BASE)
        chars.append(ALPHABET[rem])
    return "".join(reversed(chars))


def decode(token: str) -> int:
    """Decode a Base62 string back to an integer."""
    if not token:
        raise ValueError("Cannot decode an empty token")
    total = 0
    for ch in token:
        try:
            total = total * BASE + _INDEX[ch]
        except KeyError as exc:
            raise ValueError(f"Invalid Base62 character: {ch!r}") from exc
    return total


def encode_id(num: int, *, offset: int = 0, min_length: int = 0) -> str:
    """Encode an ID with an offset (so codes start at a minimum length).

    The offset is added before encoding, which guarantees that small IDs
    still produce reasonably long codes. ``min_length`` left-pads with the
    first alphabet character (``"0"``) if the encoded value is shorter.
    """
    code = encode(num + offset)
    if len(code) < min_length:
        code = ALPHABET[0] * (min_length - len(code)) + code
    return code
