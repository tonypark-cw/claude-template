# Tests for token_guard: count_tokens, check_limit, estimate_cost
import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from src import token_guard


def test_count_tokens_gemini_returns_int():
    count = token_guard.count_tokens("Hello world", "gemini")
    assert isinstance(count, int)
    assert count > 0


def test_count_tokens_openai_returns_int():
    count = token_guard.count_tokens("Hello world", "openai")
    assert isinstance(count, int)
    assert count > 0


def test_count_tokens_gemini_char_heuristic():
    # 40-char string => ~10 tokens via 4-char heuristic
    text = "a" * 40
    assert token_guard.count_tokens(text, "gemini") == 10


def test_check_limit_passes_within_limit(monkeypatch):
    monkeypatch.setattr(token_guard, "MAX_INPUT_TOKENS", 100)
    # Should not raise
    token_guard.check_limit(50)


def test_check_limit_raises_over_limit(monkeypatch):
    monkeypatch.setattr(token_guard, "MAX_INPUT_TOKENS", 10)
    with pytest.raises(ValueError, match="exceeds limit"):
        token_guard.check_limit(11)


def test_estimate_cost_returns_float():
    cost = token_guard.estimate_cost(1000, "gemini")
    assert isinstance(cost, float)
    assert cost >= 0


def test_estimate_cost_openai_higher_than_gemini():
    gemini_cost = token_guard.estimate_cost(5000, "gemini")
    openai_cost = token_guard.estimate_cost(5000, "openai")
    assert openai_cost >= gemini_cost
