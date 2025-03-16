from fastapi import HTTPException
from app.rfq.models import RFQDocument
from bson import ObjectId
from app.rfq.models import RequirementEvaluation, Requirement
from app.evaluation.llm import evaluate_requirement
from app.company.facade import update_company_facts, get_company_context

import logging
logger = logging.getLogger(__name__)

    
async def invoke_llm_evaluation(rfq_document: RFQDocument, company_id: str):
    logger.info(f"Invoking LLM evaluation for {rfq_document.id}")
    if rfq_document.enhanced is None:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    for index, requirement in enumerate(rfq_document.enhanced.requirements):
        await handle_requirement(rfq_document, index, requirement, company_id)
    
    for lot_index, lot in enumerate(rfq_document.enhanced.lots):
        for requirement_index, requirement in enumerate(lot.requirements):
            await handle_lot_requirement(rfq_document, lot_index, requirement_index, requirement, company_id)

async def handle_requirement(rfq_document: RFQDocument, index: int, requirement: Requirement, company_id: str):
    if rfq_document.enhanced is None:
        raise ValueError("RFQ enhanced is None")
    logger.info(f"Evaluating requirement: {requirement.requirement}")
        
    updated_evaluation = RequirementEvaluation(evaluation="IN_PROGRESS", reason="LLM evaluation")
    rfq_document.enhanced.requirements[index].evaluation = updated_evaluation
    await rfq_document.save()

    llm_evaluation = await evaluate_requirement(requirement.requirement, await get_company_context(company_id))
    updated_evaluation = RequirementEvaluation(evaluation=llm_evaluation.evaluation, reason=llm_evaluation.reason)
    rfq_document.enhanced.requirements[index].evaluation = updated_evaluation
    await rfq_document.save()

async def handle_lot_requirement(rfq_document: RFQDocument, lot_index: int, requirement_index: int, requirement: Requirement, company_id: str):
    if rfq_document.enhanced is None:
        raise ValueError("RFQ enhanced is None")
    logger.info(f"Evaluating lot requirement: {requirement.requirement}")
    updated_evaluation = RequirementEvaluation(evaluation="IN_PROGRESS", reason="LLM evaluation")
    rfq_document.enhanced.lots[lot_index].requirements[requirement_index].evaluation = updated_evaluation
    await rfq_document.save()
    
    llm_evaluation = await evaluate_requirement(requirement.requirement, await get_company_context(company_id))
    updated_evaluation = RequirementEvaluation(evaluation=llm_evaluation.evaluation, reason=llm_evaluation.reason)
    rfq_document.enhanced.lots[lot_index].requirements[requirement_index].evaluation = updated_evaluation
    await rfq_document.save()
    
    
    

async def update_requirement_based_on_human_feedback(rfq_document: RFQDocument, company_id: str, requirement_index: int | None, lot_index: int | None, updated_reason: str):
    if rfq_document.enhanced is None:
        raise ValueError("RFQ enhanced is None")

    if requirement_index is not None and lot_index is not None:
        req = rfq_document.enhanced.lots[lot_index].requirements[requirement_index]
        
        await update_company_facts(company_id, req.evaluation.reason, updated_reason, req.requirement_source)
        await handle_lot_requirement(rfq_document, lot_index, requirement_index, req, company_id)
    elif requirement_index is not None and lot_index is None:
        req = rfq_document.enhanced.requirements[requirement_index]
        await update_company_facts(company_id, req.evaluation.reason, updated_reason, req.requirement_source)
        await handle_requirement(rfq_document, requirement_index, req, company_id)
    else:
        raise HTTPException(status_code=400, detail="requirement_index and lot_index cannot both be None")
    
    