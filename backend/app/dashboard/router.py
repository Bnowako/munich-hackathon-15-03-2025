from app.rfq.models import RFQDocument
from fastapi import APIRouter
from app.rfq.router import get_rfq_status
from app.dashboard.schemas import RFQStatusResponse
from typing import List

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/")
async def get_rfqs_by_status() -> List[RFQStatusResponse]:
    rfqs = await RFQDocument.find(RFQDocument.enhanced != None).to_list()
    responses = []
    for rfq in rfqs:
        status = await get_rfq_status(rfq)
        responses.append(RFQStatusResponse(
            id=str(rfq.id),
            title=rfq.enhanced.title,
            status=status
        ))
    return responses