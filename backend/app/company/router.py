from typing import List
from fastapi import APIRouter, HTTPException
from bson import ObjectId
from .models import CompanyDocument
from .schemas import CompanyResponse, CompanyCreate, CompanyUpdate

router = APIRouter(prefix="/company", tags=["company"])

@router.get("/current")
async def get_current_company() -> CompanyResponse:
    company = await CompanyDocument.find_one(CompanyDocument.name == "Railway Co")
    
    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    
    return CompanyResponse(
        id=str(company.id),
        name=company.name,
        facts=company.facts,
    )

@router.put("/{company_id}")
async def update_company(company_id: str, company_update: CompanyUpdate) -> CompanyResponse:
    company = await CompanyDocument.find_one(CompanyDocument.id == ObjectId(company_id))
    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    
    company.name = company_update.name
    company.facts = company_update.facts
    await company.save()
    return CompanyResponse(
        id=str(company.id),
        name=company.name,
        facts=company.facts,
    )