# Build evaluation prompt from code context and rubric markdown
SYSTEM_MESSAGE = (
    "You are an independent code reviewer. "
    "Evaluate the code strictly against the rubric. "
    "Output ONLY valid JSON matching the schema. "
    "Do not hedge or be lenient."
)

JSON_SCHEMA = """
{
  "scores": [
    {
      "criterion": "<criterion name>",
      "score": <integer 1-5>,
      "evidence": "<specific evidence from the code>",
      "verdict": "<PASS|CONDITIONAL|FAIL>"
    }
  ],
  "overall_score": "<points>/<max>",
  "percentage": <float 0-100>,
  "verdict": "<PASS|CONDITIONAL|FAIL>",
  "rationale": "<one paragraph summary>"
}
"""


def build_prompt(code_context: str, rubric_markdown: str) -> str:
    """Return the full evaluation prompt string."""
    return (
        f"{SYSTEM_MESSAGE}\n\n"
        f"## Rubric\n\n"
        f"{rubric_markdown}\n\n"
        f"## Code to Evaluate\n\n"
        f"```\n{code_context}\n```\n\n"
        f"## Required Output Schema\n\n"
        f"{JSON_SCHEMA}\n\n"
        "Respond with ONLY the JSON object. No markdown, no explanation."
    )
