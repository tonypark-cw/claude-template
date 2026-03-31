# Tool implementation logic called by server.py tool handlers
import json
import os

from . import cache, token_guard
from .models import AvailableModels, CostEstimate, EvaluationResponse, ModelInfo
from .prompt_builder import build_prompt

PRICING = {"gemini": 0.10, "openai": 0.15}
DEFAULT_MODELS = {"gemini": "gemini-2.5-flash-lite", "openai": "gpt-4o-mini"}


async def _call_backend(model: str, prompt: str, max_tokens: int) -> dict:
    if model == "gemini":
        from .backends.gemini import call_gemini
        return await call_gemini(prompt, max_tokens)
    if model == "openai":
        from .backends.openai_backend import call_openai
        return await call_openai(prompt, max_tokens)
    raise ValueError(f"Unknown backend '{model}'. Use 'gemini' or 'openai'.")


async def run_cross_evaluate(
    code_context: str, rubric_markdown: str, model: str, max_output_tokens: int
) -> str:
    prompt = build_prompt(code_context, rubric_markdown)
    token_guard.check_limit(token_guard.count_tokens(prompt, model))
    cache_key = cache.make_key(code_context, rubric_markdown, model)
    hit = cache.get(cache_key)
    if hit:
        hit["cached"] = True
        return json.dumps(hit)
    try:
        result = await _call_backend(model, prompt, max_output_tokens)
        parsed = json.loads(result["text"])
        parsed.update({"model": model, "input_tokens_used": result["input_tokens"],
                        "output_tokens_used": result["output_tokens"], "cached": False})
        data = EvaluationResponse(**parsed).model_dump()
        cache.set(cache_key, data)
        return json.dumps(data)
    except Exception as exc:
        return json.dumps({"error": str(exc), "model": model})


async def run_estimate_cost(code_context: str, rubric_markdown: str, model: str) -> str:
    prompt = build_prompt(code_context, rubric_markdown)
    n = token_guard.count_tokens(prompt, model)
    result = CostEstimate(
        estimated_input_tokens=n,
        estimated_output_tokens=token_guard.ESTIMATED_OUTPUT_TOKENS,
        estimated_cost_usd=token_guard.estimate_cost(n, model),
        within_limit=n <= token_guard.MAX_INPUT_TOKENS,
    )
    return json.dumps(result.model_dump())


ROLE_PROMPTS = {
    "architect": "당신은 시니어 소프트웨어 아키텍트입니다. 한국어로 답변하세요.",
    "reviewer": "당신은 시니어 코드 리뷰어입니다. 한국어로 답변하세요.",
}


async def run_debate_send(
    message: str, role: str, model: str, max_output_tokens: int
) -> str:
    system = ROLE_PROMPTS.get(role, ROLE_PROMPTS["architect"])
    full_prompt = f"{system}\n\n{message}"
    try:
        result = await _call_backend(model, full_prompt, max_output_tokens)
        return result["text"]
    except Exception as exc:
        return json.dumps({"error": str(exc), "model": model})


async def run_list_available_models() -> str:
    def _info(key_env: str, model_env: str, backend: str) -> ModelInfo:
        return ModelInfo(
            available=bool(os.environ.get(key_env, "")),
            model=os.environ.get(model_env, DEFAULT_MODELS[backend]),
            price_per_1m_input=PRICING[backend],
        )
    result = AvailableModels(
        gemini=_info("GOOGLE_GEMINI_API_KEY", "GEMINI_MODEL", "gemini"),
        openai=_info("OPENAI_API_KEY", "OPENAI_MODEL", "openai"),
    )
    return json.dumps(result.model_dump())
