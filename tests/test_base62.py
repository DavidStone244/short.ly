"""Unit tests for the base62 encoder."""

from __future__ import annotations

import pytest

from shortly import base62


@pytest.mark.parametrize(
    ("number", "expected"),
    [
        (0, "0"),
        (1, "1"),
        (10, "A"),
        (61, "z"),
        (62, "10"),
        (3843, "zz"),
        (3844, "100"),
    ],
)
def test_encode_known_values(number: int, expected: str) -> None:
    assert base62.encode(number) == expected


@pytest.mark.parametrize("number", [0, 1, 42, 1000, 999_999, 2**32 - 1, 2**40])
def test_encode_then_decode_is_identity(number: int) -> None:
    assert base62.decode(base62.encode(number)) == number


def test_encode_negative_raises() -> None:
    with pytest.raises(ValueError):
        base62.encode(-1)


def test_decode_empty_raises() -> None:
    with pytest.raises(ValueError):
        base62.decode("")


def test_decode_invalid_character_raises() -> None:
    with pytest.raises(ValueError):
        base62.decode("ab$cd")


def test_encode_id_pads_to_min_length() -> None:
    code = base62.encode_id(1, offset=0, min_length=6)
    assert len(code) == 6
    assert code.endswith("1")


def test_encode_id_offset_yields_long_codes() -> None:
    # With an offset of 10_000 + min_length=6, the very first id (1) should
    # already produce a 6-character code.
    code = base62.encode_id(1, offset=10_000, min_length=6)
    assert len(code) == 6
