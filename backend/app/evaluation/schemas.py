from pydantic import BaseModel

class EvaluationResponse(BaseModel):
    requirements_to_notes: list[dict[str, str]] # {requirement: note}

class EvaluationRequest(BaseModel):
    rfq_id: str
    requirements_to_notes: list[dict[str, str]] # {requirement: note}

class Evaluation(BaseModel):
    id: str
    rfq_id: str
    requirements_to_notes: list[dict[str, str]] # {requirement: note}