from app.rfq.models import RFQDocument
from app.rfq.schemas import RFQResponse
from fastapi import APIRouter
from app.evaluation.models import EvaluationDocument

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/")
async def get_rfqs_by_status() -> List[RFQResponse]:
    rfqs = await RFQDocument.find(RFQDocument.enhanced != None).to_list()
    responses = []
    for rfq in rfqs:
        evaluation = await EvaluationDocument.find_one(EvaluationDocument.rfq_id == str(rfq.id))
        if evaluation is None:
            status = "open"
        else:
            all_evaluated = all(
                item.llm_evaluation.evaluation in ["ELIGIBLE", "NOT_ELIGIBLE"]
                for item in evaluation.requirements_metadata
            )
            status = "closed" if all_evaluated else "in evaluation"
        responses.append(RFQResponse(
            id=str(rfq.id),
            title=rfq.enhanced.title,
            description=rfq.enhanced.description,
            requirements=rfq.enhanced.requirements,
            status=status
        ))
    return responses