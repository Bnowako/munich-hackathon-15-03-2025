from typing import Literal

from beanie import Document
from bson import ObjectId
from pydantic import BaseModel, Field


class RequirementEvaluation(BaseModel):
    evaluation: Literal["ELIGIBLE", "NOT_ELIGIBLE", "UNKNOWN"] | None = None
    reason: str | None = None

class RequirementMetadata(BaseModel):
    requirement: str
    llm_evaluation: RequirementEvaluation
    human_evaluation: RequirementEvaluation

class EvaluationDocument(Document):
    rfq_id: str
    requirements_metadata: list[RequirementMetadata]
    