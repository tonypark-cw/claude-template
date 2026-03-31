# Google Gemini backend wrapper for evaluation calls
import asyncio
import os


async def call_gemini(prompt: str, max_tokens: int = 2000) -> dict:
    """Call Gemini API and return text + token usage."""
    api_key = os.environ.get("GOOGLE_GEMINI_API_KEY")
    if not api_key:
        raise ValueError(
            "GOOGLE_GEMINI_API_KEY is not set. "
            "Export the variable before starting the MCP server."
        )

    try:
        import google.generativeai as genai
    except ImportError:
        raise RuntimeError("google-generativeai is not installed. Run: uv sync")

    genai.configure(api_key=api_key)
    model_name = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash-lite")
    model = genai.GenerativeModel(model_name)

    response = await asyncio.to_thread(
        model.generate_content,
        prompt,
        generation_config=genai.GenerationConfig(
            max_output_tokens=max_tokens,
            response_mime_type="application/json",
        ),
    )

    usage = response.usage_metadata
    return {
        "text": response.text,
        "input_tokens": getattr(usage, "prompt_token_count", 0),
        "output_tokens": getattr(usage, "candidates_token_count", 0),
    }
