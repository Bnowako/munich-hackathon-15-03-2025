from pydantic import BaseModel
from app.evaluation.models import EvaluationType

class RequirementEvaluationResponse(BaseModel):
    evaluation: EvaluationType
    reason: str

class RequirementResponse(BaseModel):
    requirement: str
    requirement_source: str
    evaluation: RequirementEvaluationResponse

class LotResponse(BaseModel):
    title: str
    description: str
    requirements: list[RequirementResponse]
    lot_source: str

class RFQResponse(BaseModel):
    id: str
    title: str
    description: str
    requirements: list[RequirementResponse]
    raw_xml: str
    lots: list[LotResponse]
    status: str
