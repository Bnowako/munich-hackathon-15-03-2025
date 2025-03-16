from pydantic import BaseModel

class UpdateRequirementEvaluationRequest(BaseModel):
    requirement_index: int | None = None
    lot_index: int | None = None
    updated_reason: str
    

