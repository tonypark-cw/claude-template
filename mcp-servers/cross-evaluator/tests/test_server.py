# Tests for EvaluationResponse model and prompt_builder behaviour
import sys
import os

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from src.models import CriterionScore, EvaluationResponse
from src.prompt_builder import build_prompt


def _sample() -> dict:
    return {
        "model": "gemini",
        "scores": [{"criterion": "Readability", "score": 4,
                    "evidence": "Clear names", "verdict": "PASS"}],
        "overall_score": "4/5", "percentage": 80.0, "verdict": "PASS",
        "rationale": "Good code.", "input_tokens_used": 500, "output_tokens_used": 120,
    }


def test_evaluation_response_valid():
    resp = EvaluationResponse(**_sample())
    assert resp.verdict == "PASS"
    assert resp.cached is False


def test_evaluation_response_cached_flag():
    resp = EvaluationResponse(**{**_sample(), "cached": True})
    assert resp.cached is True


def test_criterion_score_invalid_type():
    with pytest.raises(Exception):
        CriterionScore(criterion="C", score="bad", evidence="e", verdict="PASS")


def test_prompt_contains_rubric():
    prompt = build_prompt("def foo(): pass", "## Criterion\nCode quality")
    assert "## Criterion" in prompt
    assert "Code quality" in prompt


def test_prompt_contains_code():
    prompt = build_prompt("def bar(): return 1", "## Rubric")
    assert "def bar(): return 1" in prompt


def test_prompt_contains_json_schema():
    prompt = build_prompt("code", "rubric")
    assert "overall_score" in prompt
    assert "verdict" in prompt


def test_prompt_system_message_present():
    prompt = build_prompt("x = 1", "rubric")
    assert "independent code reviewer" in prompt
