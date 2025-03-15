import asyncio
from fastapi import HTTPException
from app.rfq.models import RFQDocument
from bson import ObjectId
from app.evaluation.schemas import EvaluationResponse
from app.evaluation.models import RequirementEvaluation, EvaluationDocument, RequirementMetadata
from app.evaluation.llm import evaluate_requirement

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
    logger.info(f"Invoking LLM evaluation for {evaluation.rfq_id}")
    
    for index, metadata in enumerate(evaluation.requirements_metadata):
        logger.info(f"Evaluating requirement: {metadata.requirement}")
        
        # Create a new instance of the nested model with updated values
        updated_llm_evaluation = metadata.llm_evaluation.model_copy(update={
            "evaluation": "IN_PROGRESS",
            "reason": "LLM evaluation"
        })
        # Reassign the new instance back to the list
        evaluation.requirements_metadata[index].llm_evaluation = updated_llm_evaluation
        
        await evaluation.save()

        llm_evaluation = await evaluate_requirement(metadata.requirement, "Company: Railway Co. Facts: Railway Co. is a railway company that builds railways and sells railway tickets")

        updated_llm_evaluation = metadata.llm_evaluation.model_copy(update={
            "evaluation": llm_evaluation.evaluation,
            "reason": llm_evaluation.reason
        })
        evaluation.requirements_metadata[index].llm_evaluation = updated_llm_evaluation
        await evaluation.save()
