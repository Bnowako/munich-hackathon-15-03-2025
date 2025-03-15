from fastapi import HTTPException
from app.rfq.models import RFQDocument
from bson import ObjectId
from app.evaluation.models import RequirementEvaluation, EvaluationDocument, RequirementMetadata
from app.evaluation.llm import evaluate_requirement
from app.company.facade import update_company_facts, get_company_context

import logging
logger = logging.getLogger(__name__)

async def init_evaluation(rfq_id: str):
    rfq = await RFQDocument.find_one(RFQDocument.id == ObjectId(rfq_id))
    if rfq is None or rfq.enhanced is None:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    evaluation = EvaluationDocument(
        rfq_id=rfq_id,
        requirements_metadata=[]
    )

    for requirement in rfq.enhanced.requirements:
        evaluation.requirements_metadata.append(
            RequirementMetadata(
                requirement=requirement,
                evaluation=RequirementEvaluation(
                    evaluation="INITIAL",
                    reason="Not evaluated yet"
                ),
            )
        )
        logger.info(f"Evaluating requirement: {requirement}")
    
    await evaluation.save()
    
    

async def invoke_llm_evaluation(evaluation: EvaluationDocument, company_id: str):
    logger.info(f"Invoking LLM evaluation for {evaluation.rfq_id}")
    
    for index, metadata in enumerate(evaluation.requirements_metadata):
        logger.info(f"Evaluating requirement: {metadata.requirement}")
        
        # Create a new instance of the nested model with updated values
        updated_evaluation = metadata.evaluation.model_copy(update={
            "evaluation": "IN_PROGRESS",
            "reason": "LLM evaluation"
        })
        # Reassign the new instance back to the list
        evaluation.requirements_metadata[index].evaluation = updated_evaluation
        
        await evaluation.save()

        llm_evaluation = await evaluate_requirement(metadata.requirement, await get_company_context(company_id))

        updated_evaluation = metadata.evaluation.model_copy(update={
            "evaluation": llm_evaluation.evaluation,
            "reason": llm_evaluation.reason
        })
        evaluation.requirements_metadata[index].evaluation = updated_evaluation
        await evaluation.save()



async def update_requirement_based_on_human_feedback(evaluation: EvaluationDocument, requirement: str, updated_reason: str, company_id: str):
    logger.info(f"Invoking update_requirement for {evaluation.rfq_id} with reason: {requirement} and updated_reason: {updated_reason} and company_id: {company_id}")
    
    # Find the index of the metadata that matches the requirement
    metadata_index = next((index for index, metadata in enumerate(evaluation.requirements_metadata) 
                          if metadata.requirement == requirement), None)
    if metadata_index is None:
        return None
    
    evaluation_metadata = evaluation.requirements_metadata[metadata_index]
    previous_reason: str = evaluation_metadata.evaluation.reason

    logger.info(f"Evaluating requirement: {evaluation_metadata.requirement}")
    # Create a new instance of the nested model with updated values
    updated_evaluation = RequirementEvaluation(evaluation="IN_PROGRESS",reason="LLM evaluation")
    
    # Update the evaluation in the list using the index
    evaluation.requirements_metadata[metadata_index].evaluation = updated_evaluation
    await evaluation.save()

    
    await update_company_facts(id=company_id, reason=previous_reason, updated_reason=updated_reason)
    llm_evaluation = await evaluate_requirement(evaluation_metadata.requirement, await get_company_context(company_id))

    updated_evaluation = RequirementEvaluation(evaluation=llm_evaluation.evaluation, reason=llm_evaluation.reason)
    
    # Update the evaluation in the list using the index
    evaluation.requirements_metadata[metadata_index].evaluation = updated_evaluation
    await evaluation.save()