from app.rfq.models import RFQDocument
from fastapi import APIRouter
from app.evaluation.models import EvaluationDocument
from app.dashboard.schemas import RFQStatusResponse
from typing import List

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/")
async def get_rfqs_by_status() -> List[RFQStatusResponse]:
    rfqs = await RFQDocument.find(RFQDocument.enhanced != None).to_list()
    responses = []
    for rfq in rfqs:
        evaluation = await EvaluationDocument.find_one(EvaluationDocument.rfq_id == str(rfq.id))
        if evaluation is None:
            status = "open"
        else:
            all_evaluated = all(
                item.evaluation.evaluation in ["ELIGIBLE", "NOT_ELIGIBLE"]
                for item in evaluation.requirements_metadata
            )
            status = "closed" if all_evaluated else "in evaluation"
        responses.append(RFQStatusResponse(
            id=str(rfq.id),
            title=rfq.enhanced.title,
            status=status
        ))
    return responses