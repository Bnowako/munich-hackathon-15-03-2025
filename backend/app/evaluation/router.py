from typing import List
from bson import ObjectId
from fastapi import APIRouter, HTTPException
from .models import EvaluationDocument
from .schemas import EvaluationResponse, RequirementMetadataResponse, RequirementEvaluationResponse

router = APIRouter(prefix="/evaluation", tags=["evaluation"])

@router.get("/{rfq_id}")
async def get_evaluation(rfq_id: str) -> EvaluationResponse:
    evaluation = await EvaluationDocument.find_one(EvaluationDocument.rfq_id == rfq_id)
    if evaluation is None:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    return _map_evaluation_to_response(evaluation)

@router.put("/{rfq_id}")
async def request_evaluation(rfq_id: str) -> EvaluationResponse:
    evaluation = await EvaluationDocument.find_one(EvaluationDocument.rfq_id == rfq_id)
    if evaluation is None:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    # todo request evaluation from llm

    return _map_evaluation_to_response(evaluation)


def _map_evaluation_to_response(evaluation: EvaluationDocument) -> EvaluationResponse:
    return EvaluationResponse(
        id=str(evaluation.id),
        rfq_id=str(evaluation.rfq_id),
        requirements_metadata=[RequirementMetadataResponse(
            requirement=metadata.requirement,
            llm_evaluation=RequirementEvaluationResponse(
                evaluation=metadata.llm_evaluation.evaluation,
                reason=metadata.llm_evaluation.reason
            ),
            human_evaluation=RequirementEvaluationResponse(
                evaluation=metadata.human_evaluation.evaluation,
                reason=metadata.human_evaluation.reason
            )
        ) for metadata in evaluation.requirements_metadata]
    )