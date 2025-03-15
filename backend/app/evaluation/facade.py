import asyncio
from fastapi import HTTPException
from app.rfq.models import RFQDocument
from bson import ObjectId
from app.evaluation.schemas import EvaluationResponse
from app.evaluation.models import RequirementEvaluation, EvaluationDocument, RequirementMetadata

import logging
logger = logging.getLogger(__name__)

async def create_blank_evaluation(rfq_id: str):
    rfq = await RFQDocument.find_one(RFQDocument.id == ObjectId(rfq_id))
    if rfq is None:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    if rfq.enhanced is None:
        raise HTTPException(status_code=400, detail="RFQ has not been enhanced yet")
    

    evaluation = EvaluationDocument(
        rfq_id=rfq_id,
        requirements_metadata=[]
    )

    for requirement in rfq.enhanced.requirements:
        evaluation.requirements_metadata.append(
            RequirementMetadata(
                requirement=requirement,
                llm_evaluation=RequirementEvaluation(
                    evaluation=None,
                    reason="Not evaluated yet"
                ),
                human_evaluation=RequirementEvaluation(
                    evaluation=None,
                    reason="Not evaluated yet"
                )
            )
        )
        logger.info(f"Evaluating requirement: {requirement}")
    
    await evaluation.save()
    
    

async def invoke_llm_evaluation(evaluation: EvaluationDocument):
    for metadata in evaluation.requirements_metadata:
        metadata.llm_evaluation.evaluation = "ELIGIBLE"
        metadata.llm_evaluation.reason = "LLM evaluation"
        await evaluation.save()
        await asyncio.sleep(4)
