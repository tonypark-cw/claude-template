# Tests for cache hit/miss/TTL behaviour
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from src import cache as cache_module


def test_cache_miss_returns_none():
    cache_module.clear()
    assert cache_module.get("nonexistent") is None


def test_cache_set_and_get():
    cache_module.clear()
    key = cache_module.make_key("code", "rubric", "gemini")
    cache_module.set(key, {"result": 1})
    assert cache_module.get(key) == {"result": 1}


def test_cache_ttl_expiry(monkeypatch):
    cache_module.clear()
    key = cache_module.make_key("c", "r", "openai")
    cache_module.set(key, {"x": 1})
    monkeypatch.setattr(cache_module, "TTL_SECONDS", -1)
    assert cache_module.get(key) is None


def test_cache_key_differs_by_model():
    k1 = cache_module.make_key("code", "rubric", "gemini")
    k2 = cache_module.make_key("code", "rubric", "openai")
    assert k1 != k2


def test_cache_key_same_inputs_equal():
    k1 = cache_module.make_key("abc", "def", "gemini")
    k2 = cache_module.make_key("abc", "def", "gemini")
    assert k1 == k2


def test_cache_clear():
    key = cache_module.make_key("x", "y", "gemini")
    cache_module.set(key, {"v": 99})
    cache_module.clear()
    assert cache_module.get(key) is None
