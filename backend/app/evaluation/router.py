import asyncio
from typing import List
from app.company.models import CompanyDocument
from bson import ObjectId
from fastapi import APIRouter, HTTPException
from .models import EvaluationDocument, RequirementEvaluation
from .schemas import EvaluationResponse, RequirementMetadataResponse, RequirementEvaluationResponse
from .facade import invoke_llm_evaluation, update_requirement_based_on_human_feedback
from .schemas import UpdateRequirementEvaluationRequest
from app.rfq.models import RFQDocument

import logging
logger = logging.getLogger(__name__)
router = APIRouter(prefix="/evaluation", tags=["evaluation"])

@router.put("/{rfq_id}")
async def request_evaluation(rfq_id: str):
    company = (await CompanyDocument.find_all().to_list())
    if len(company) == 0:
        raise HTTPException(status_code=404, detail="Company not found")
    company = company[0]
    
    rfq_document = await RFQDocument.find_one(RFQDocument.id == ObjectId(rfq_id))
    if rfq_document is None:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    logger.info(f"Requesting evaluation for {rfq_id}")
    asyncio.create_task(invoke_llm_evaluation(rfq_document, str(company.id)))


@router.put("/{rfq_id}/requirements")
async def update_requirement_evaluation(rfq_id: str, request: UpdateRequirementEvaluationRequest):
    company = (await CompanyDocument.find_all().to_list())
    if len(company) == 0:
        raise HTTPException(status_code=404, detail="Company not found")
    company = company[0]

    evaluation = await EvaluationDocument.find_one(EvaluationDocument.rfq_id == rfq_id)
    if evaluation is None:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    asyncio.create_task(update_requirement_based_on_human_feedback(evaluation, request.requirement, request.updated_reason, str(company.id))) #type: ignore

