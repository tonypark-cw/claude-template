# FastMCP server exposing 3 tools: cross_evaluate, estimate_cost, list_available_models
from mcp.server.fastmcp import FastMCP

from .tools import run_cross_evaluate, run_estimate_cost, run_list_available_models
from .tools import run_debate_send

mcp = FastMCP("cross-evaluator")


@mcp.tool()
async def cross_evaluate(
    code_context: str,
    rubric_markdown: str,
    model: str = "gemini",
    max_output_tokens: int = 2000,
) -> str:
    """Evaluate code against a rubric using an external LLM (gemini or openai).

    Args:
        code_context: The code to be evaluated (full file or diff).
        rubric_markdown: Rubric in markdown format (Korean supported).
        model: Backend to use — 'gemini' or 'openai'. Default: 'gemini'.
        max_output_tokens: Max tokens for the LLM response. Default: 2000.

    Returns:
        JSON string with EvaluationResponse fields including scores and verdict.
    """
    return await run_cross_evaluate(
        code_context, rubric_markdown, model, max_output_tokens
    )


@mcp.tool()
async def estimate_cost(
    code_context: str,
    rubric_markdown: str,
    model: str = "gemini",
) -> str:
    """Return token count and estimated cost without calling the LLM.

    Args:
        code_context: The code to be evaluated.
        rubric_markdown: Rubric in markdown format.
        model: Backend — 'gemini' or 'openai'. Default: 'gemini'.

    Returns:
        JSON with estimated_input_tokens, estimated_cost_usd, within_limit.
    """
    return await run_estimate_cost(code_context, rubric_markdown, model)


@mcp.tool()
async def list_available_models() -> str:
    """Return which API keys are configured and their model details.

    Returns:
        JSON with gemini and openai availability, model names, and pricing.
    """
    return await run_list_available_models()


@mcp.tool()
async def debate_send(
    message: str,
    role: str = "architect",
    model: str = "gemini",
    max_output_tokens: int = 4000,
) -> str:
    """Send a message to an external AI for debate (design/review).

    Args:
        message: The full prompt to send (design request, review request, etc.)
        role: Role for the external AI — 'architect' or 'reviewer'. Default: 'architect'.
        model: Backend — 'gemini' or 'openai'. Default: 'gemini'.
        max_output_tokens: Max response length. Default: 4000.

    Returns:
        The external AI's response text.
    """
    return await run_debate_send(message, role, model, max_output_tokens)


def main() -> None:
    mcp.run()


if __name__ == "__main__":
    main()
