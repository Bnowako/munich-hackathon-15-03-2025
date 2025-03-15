from pydantic import BaseModel
from typing import Literal

class RequirementEvaluationResponse(BaseModel):
    evaluation: Literal["ELIGIBLE", "NOT_ELIGIBLE", "UNKNOWN"]
    reason: str | None = None

class RequirementMetadataResponse(BaseModel):
    requirement: str
    llm_evaluation: RequirementEvaluationResponse | None = None
    human_evaluation: RequirementEvaluationResponse | None = None

class EvaluationResponse(BaseModel):
    id: str
    rfq_id: str
    requirements_metadata: list[RequirementMetadataResponse]
    