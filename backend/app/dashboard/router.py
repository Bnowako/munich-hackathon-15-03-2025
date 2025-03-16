from app.rfq.models import RFQDocument
from fastapi import APIRouter
from app.dashboard.schemas import RFQStatusResponse
from typing import List

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/")
async def get_rfqs_by_status() -> List[RFQStatusResponse]:
    rfqs = await RFQDocument.find(RFQDocument.enhanced != None).to_list()
    responses: List[RFQStatusResponse] = []
    for rfq in rfqs:
        status = rfq.get_status()
        responses.append(RFQStatusResponse(
            id=str(rfq.id),
            title=rfq.enhanced.title, # type: ignore
            status=status
        ))
    return responses