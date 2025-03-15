from typing import List
from bson import ObjectId
from fastapi import APIRouter, HTTPException
from .models import EvaluationDocument
from .schemas import EvaluationResponse

router = APIRouter(prefix="/evaluation", tags=["evaluation"])

@router.get("/")
async def get_evaluations() -> List[EvaluationResponse]:
    evaluations = await EvaluationDocument.find_all().to_list()
    return evaluations

@router.get("/{evaluation_id}")
async def get_evaluation(evaluation_id: str) -> EvaluationResponse:
    evaluation = await EvaluationDocument.find_one(EvaluationDocument.id == evaluation_id)
    if evaluation is None:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return evaluation

@router.put("/{evaluation_id}")
async def update_evaluation(rfq_id: str, evaluation: EvaluationResponse) -> EvaluationResponse:
    evaluation = EvaluationDocument(rfq_id=rfq_id, requirements_to_notes=evaluation.requirements_to_notes)
    await evaluation.save()
    return evaluation
