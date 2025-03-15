import asyncio
from typing import List
from app.company.models import CompanyDocument
from bson import ObjectId
from fastapi import APIRouter, HTTPException
from .models import EvaluationDocument, RequirementEvaluation
from .schemas import EvaluationResponse, RequirementMetadataResponse, RequirementEvaluationResponse
from .facade import create_blank_evaluation, invoke_llm_evaluation

import logging
logger = logging.getLogger(__name__)
router = APIRouter(prefix="/evaluation", tags=["evaluation"])

@router.get("/{rfq_id}")
async def get_evaluation(rfq_id: str) -> EvaluationResponse:
    evaluation = await EvaluationDocument.find_one(EvaluationDocument.rfq_id == rfq_id)
    if evaluation is None:
        await create_blank_evaluation(rfq_id)
    
    evaluation = await EvaluationDocument.find_one(EvaluationDocument.rfq_id == rfq_id)
    if evaluation is None:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    return _map_evaluation_to_response(evaluation)

@router.put("/{rfq_id}")
async def request_evaluation(rfq_id: str):
    company = (await CompanyDocument.find_all().to_list())[0]
    evaluation = await EvaluationDocument.find_one(EvaluationDocument.rfq_id == rfq_id)
    if evaluation is None:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    logger.info(f"Requesting evaluation for {rfq_id}")
    asyncio.create_task(invoke_llm_evaluation(evaluation, company.id))



def _map_requirement_evaluation_to_response(evaluation: RequirementEvaluation) -> RequirementEvaluationResponse:
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