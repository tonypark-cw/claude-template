# Token counting and limit enforcement for evaluation prompts
import os

MAX_INPUT_TOKENS = int(os.environ.get("MAX_INPUT_TOKENS", "8000"))

# Pricing per 1M tokens (input) in USD
PRICING: dict[str, float] = {
    "gemini": 0.10,   # gemini-2.5-flash-lite approximate
    "openai": 0.15,   # gpt-4o-mini approximate
}

ESTIMATED_OUTPUT_TOKENS = 800  # conservative estimate for cost calc


def count_tokens(text: str, model: str) -> int:
    """Count tokens for the given text and model backend."""
    if model == "openai":
        try:
            import tiktoken
            enc = tiktoken.get_encoding("cl100k_base")
            return len(enc.encode(text))
        except Exception:
            # Fallback to char-based heuristic if tiktoken unavailable
            return len(text) // 4
    # Gemini: 1 token per 4 chars heuristic
    return len(text) // 4


def check_limit(token_count: int) -> None:
    """Raise ValueError if token_count exceeds MAX_INPUT_TOKENS."""
    if token_count > MAX_INPUT_TOKENS:
        raise ValueError(
            f"Input too large: {token_count} tokens exceeds limit of "
            f"{MAX_INPUT_TOKENS}. Reduce code_context or rubric size."
        )


def estimate_cost(input_tokens: int, model: str) -> float:
    """Return estimated cost in USD for given input tokens and model."""
    price_per_1m = PRICING.get(model, 0.15)
    output_tokens = ESTIMATED_OUTPUT_TOKENS
    total_tokens = input_tokens + output_tokens
    return round(total_tokens * price_per_1m / 1_000_000, 6)
