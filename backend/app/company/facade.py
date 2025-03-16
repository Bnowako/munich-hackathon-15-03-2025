from app.company.models import CompanyDocument
from bson import ObjectId
from app.company.llm import llm_update_company_facts, llm_update_company_facts_with_running_text

import logging
logger = logging.getLogger(__name__)

async def get_company_context(id: str) -> str:
    company = await CompanyDocument.find_one(CompanyDocument.id == ObjectId(id))
    if company is None:
        raise ValueError("Company not found")
    
    return f"Company: {company.name} Facts: {company.facts}"

async def update_company_facts(id: str, reason: str, updated_reason: str, requirement_source: str):
    logger.info(f"Updating company facts for {id}, reason: {reason}, updated_reason: {updated_reason}, requirement_source: {requirement_source}")
    company = await CompanyDocument.find_one(CompanyDocument.id == ObjectId(id))
    if company is None:
        raise ValueError("Company not found")
    
    updated_facts = await llm_update_company_facts(company.facts, reason, updated_reason, requirement_source)
    logger.info(f"Updated facts: {updated_facts.facts}")
    company.facts = updated_facts.facts

    await company.save()

async def update_company_facts_with_running_text(id: str, running_text: str):
    company = await CompanyDocument.find_one(CompanyDocument.id == ObjectId(id))
    if company is None:
        raise ValueError("Company not found")
    
    updated_facts = await llm_update_company_facts_with_running_text(company.facts, running_text)
    
    company.facts = updated_facts.facts

    
    await company.save()