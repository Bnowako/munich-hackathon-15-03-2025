from pydantic import BaseModel
from .models import EvaluationType

class RequirementEvaluationResponse(BaseModel):
    evaluation: EvaluationType | None = None
    reason: str | None = None

class RequirementMetadataResponse(BaseModel):
    requirement: str
    llm_evaluation: RequirementEvaluationResponse
    human_evaluation: RequirementEvaluationResponse

class EvaluationResponse(BaseModel):
    id: str
    rfq_id: str
    requirements_metadata: list[RequirementMetadataResponse]
    

class UpdateRequirementEvaluationRequest(BaseModel):
    reason: str
    updated_reason: str
    

