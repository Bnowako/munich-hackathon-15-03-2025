from typing import List
from bson import ObjectId
from fastapi import APIRouter, HTTPException
from .models import EvaluationDocument, RequirementEvaluation
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
    if evaluation is not None:
        raise HTTPException(status_code=400, detail="Evaluation already exists")
    
    # todo request evaluation from llm

    return _map_evaluation_to_response(evaluation) # type: ignore


def _map_requirement_evaluation_to_response(evaluation: RequirementEvaluation | None) -> RequirementEvaluationResponse | None:
    if evaluation is None:
        return None
    return RequirementEvaluationResponse(
        evaluation=evaluation.evaluation,
        reason=evaluation.reason
    )

def _map_evaluation_to_response(evaluation: EvaluationDocument) -> EvaluationResponse:
    return EvaluationResponse(
        id=str(evaluation.id),
        rfq_id=str(evaluation.rfq_id),
        requirements_metadata=[RequirementMetadataResponse(
            requirement=metadata.requirement,
            llm_evaluation=_map_requirement_evaluation_to_response(metadata.llm_evaluation),
            human_evaluation=_map_requirement_evaluation_to_response(metadata.human_evaluation)
        ) for metadata in evaluation.requirements_metadata]
    )