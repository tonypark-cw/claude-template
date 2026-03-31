# In-memory SHA-256 cache with 1-hour TTL for evaluation responses
import hashlib
import time
from typing import Any

_CACHE: dict[str, tuple[Any, float]] = {}
TTL_SECONDS = 3600  # 1 hour


def make_key(code: str, rubric: str, model: str) -> str:
    """Return SHA-256 hex digest of combined inputs."""
    payload = f"{code}||{rubric}||{model}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def get(key: str) -> Any | None:
    """Return cached value if present and not expired, else None."""
    entry = _CACHE.get(key)
    if entry is None:
        return None
    value, ts = entry
    if time.time() - ts > TTL_SECONDS:
        del _CACHE[key]
        return None
    return value


def set(key: str, value: Any) -> None:
    """Store value with current timestamp."""
    _CACHE[key] = (value, time.time())


def clear() -> None:
    """Remove all entries (used in tests)."""
    _CACHE.clear()
