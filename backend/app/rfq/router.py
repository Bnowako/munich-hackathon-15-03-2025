from typing import List, Optional
from app.evaluation.models import EvaluationDocument
from bson import ObjectId
from fastapi import APIRouter, HTTPException
from .models import RFQDocument
from .schemas import RFQResponse, RequirementResponse, LotResponse

router = APIRouter(prefix="/rfq", tags=["rfq"])


async def get_rfq_status(rfq: RFQDocument) -> str:
    evaluation = await EvaluationDocument.find_one(EvaluationDocument.rfq_id == str(rfq.id))
    if evaluation is None:
        status = "open"
    else:
        all_evaluated = all(
            item.evaluation.evaluation in ["ELIGIBLE", "NOT_ELIGIBLE"]
            for item in evaluation.requirements_metadata
        )
        status = "closed" if all_evaluated else "in evaluation"
    return status

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
                raw_xml=rfq.parsed.raw_xml,
                lots=[LotResponse(title=lot.title, description=lot.description, requirements=[RequirementResponse(requirement=requirement.requirement, requirement_source=requirement.requirement_source) for requirement in lot.requirements], lot_source=lot.lot_source) for lot in rfq.enhanced.lots],
                status=await get_rfq_status(rfq)
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
        raw_xml=rfq.parsed.raw_xml,
        lots=[LotResponse(title=lot.title, description=lot.description, requirements=[RequirementResponse(requirement=requirement.requirement, requirement_source=requirement.requirement_source) for requirement in lot.requirements], lot_source=lot.lot_source) for lot in rfq.enhanced.lots],
        status=await get_rfq_status(rfq)
    )
