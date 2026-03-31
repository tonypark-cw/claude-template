# OpenAI backend wrapper for evaluation calls
import os


async def call_openai(prompt: str, max_tokens: int = 2000) -> dict:
    """Call OpenAI chat completions API and return text + token usage."""
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise ValueError(
            "OPENAI_API_KEY is not set. "
            "Export the variable before starting the MCP server."
        )

    try:
        from openai import AsyncOpenAI
    except ImportError:
        raise RuntimeError("openai package is not installed. Run: uv sync")

    client = AsyncOpenAI(api_key=api_key)
    model_name = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")

    response = await client.chat.completions.create(
        model=model_name,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
        response_format={"type": "json_object"},
    )

    return {
        "text": response.choices[0].message.content,
        "input_tokens": response.usage.prompt_tokens,
        "output_tokens": response.usage.completion_tokens,
    }
