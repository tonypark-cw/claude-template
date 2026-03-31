# Pydantic models for evaluation request/response data structures
from pydantic import BaseModel


class CriterionScore(BaseModel):
    criterion: str
    score: int  # 1-5
    evidence: str
    verdict: str  # PASS / CONDITIONAL / FAIL


class EvaluationResponse(BaseModel):
    model: str
    scores: list[CriterionScore]
    overall_score: str  # e.g. "22/30"
    percentage: float
    verdict: str  # PASS / CONDITIONAL / FAIL
    rationale: str
    input_tokens_used: int
    output_tokens_used: int
    cached: bool = False


class CostEstimate(BaseModel):
    estimated_input_tokens: int
    estimated_output_tokens: int
    estimated_cost_usd: float
    within_limit: bool


class ModelInfo(BaseModel):
    available: bool
    model: str
    price_per_1m_input: float


class AvailableModels(BaseModel):
    gemini: ModelInfo
    openai: ModelInfo
