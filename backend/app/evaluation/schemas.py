from pydantic import BaseModel
from .models import EvaluationType

class RequirementEvaluationResponse(BaseModel):
    evaluation: EvaluationType | None = None
    reason: str | None = None

class RequirementMetadataResponse(BaseModel):
    requirement: str
    evaluation: RequirementEvaluationResponse

class EvaluationResponse(BaseModel):
    id: str
    rfq_id: str
    requirements_metadata: list[RequirementMetadataResponse]
    

class UpdateRequirementEvaluationRequest(BaseModel):
    requirement: str
    updated_reason: str
    

