from typing import List
from bson import ObjectId
from fastapi import APIRouter, HTTPException
from .models import RFQDocument
from .schemas import RFQResponse

router = APIRouter(prefix="/rfq", tags=["rfq"])

@router.get("/")
async def get_rfqs() -> List[RFQResponse]:
    rfqs = await RFQDocument.find_all().to_list()
    return [RFQResponse(
        id=str(rfq.id),
        title=rfq.enhanced.title,
        description=rfq.enhanced.description,
        requirements=rfq.enhanced.requirements,
    ) for rfq in rfqs]

@router.get("/{rfq_id}")
async def get_rfq(rfq_id: str) -> RFQResponse:
    rfq = await RFQDocument.find_one(RFQDocument.id == ObjectId(rfq_id))
    if rfq is None:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    return RFQResponse(
        id=str(rfq.id),
        title=rfq.enhanced.title,
        description=rfq.enhanced.description,
        requirements=rfq.enhanced.requirements,
    )
