from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, HTTPException
from .models import RFQDocument
from .schemas import RFQResponse, RequirementResponse

router = APIRouter(prefix="/rfq", tags=["rfq"])

@router.get("/")
async def get_rfqs() -> List[RFQResponse]:
    rfqs = await RFQDocument.find(RFQDocument.enhanced != None).to_list()

    result: List[RFQResponse] = []
    for rfq in rfqs:
        if rfq.enhanced is not None:
            result.append(RFQResponse(
                id=str(rfq.id),
                title=rfq.enhanced.title,
                description=rfq.enhanced.description,
                requirements=[RequirementResponse(requirement=requirement.requirement, requirement_source=requirement.requirement_source) for requirement in rfq.enhanced.requirements],
            ))
    return result

@router.get("/{rfq_id}")
async def get_rfq(rfq_id: str) -> RFQResponse:
    rfq = await RFQDocument.find_one(RFQDocument.id == ObjectId(rfq_id))
    if rfq is None:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    if rfq.enhanced is None:
        raise HTTPException(status_code=404, detail="RFQ enhanced data not found")
    
    return RFQResponse(
        id=str(rfq.id),
        title=rfq.enhanced.title,
        description=rfq.enhanced.description,
        requirements=[RequirementResponse(requirement=requirement.requirement, requirement_source=requirement.requirement_source) for requirement in rfq.enhanced.requirements],
    )
