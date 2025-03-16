from typing import Any, Dict, Literal
from pydantic import BaseModel, Field

from beanie import Document


class ExtractedRequirement(BaseModel):
    requirement: str
    requirement_source: str


class ExtractedLot(BaseModel):
    title: str
    description: str
    requirements: list[ExtractedRequirement]
    lot_source: str

class ExtractedEnhancedRFQ(BaseModel):
    title: str
    description: str
    requirements: list[ExtractedRequirement]
    lots: list[ExtractedLot]


EvaluationType = Literal["ELIGIBLE", "NOT_ELIGIBLE", "UNKNOWN", "IN_PROGRESS", "INITIAL"]

class RequirementEvaluation(BaseModel):
    evaluation: EvaluationType
    reason: str

class Requirement(BaseModel):
    requirement: str
    requirement_source: str

    evaluation: RequirementEvaluation = RequirementEvaluation(evaluation="INITIAL", reason="Not evaluated yet")

class Lot(BaseModel):
    title: str
    description: str
    requirements: list[Requirement]
    lot_source: str

class EnhancedRFQ(BaseModel):
    title: str
    description: str
    requirements: list[Requirement]
    lots: list[Lot]

class ParsedXmlRfQ(BaseModel):
    type: Literal["ContractAwardNotice", "ContractNotice", "urn:ContractNotice", "PriorInformationNotice", "urn:ContractAwardNotice", "pin:PriorInformationNotice", "cn:ContractNotice", "can:ContractAwardNotice", "urn:PriorInformationNotice"]
    title: str
    description: str
    procurement_project_lot: list[Dict[str, Any]]
    cpv_codes: list[str]
    raw_xml: str

class RFQDocument(Document):
    parsed: ParsedXmlRfQ
    enhanced: EnhancedRFQ | None = None


def map_extracted_rfq_to_rfq_document(extracted_rfq: ExtractedEnhancedRFQ) -> EnhancedRFQ:
    return EnhancedRFQ(
        title=extracted_rfq.title,
        description=extracted_rfq.description,
        requirements=[Requirement(requirement=requirement.requirement, requirement_source=requirement.requirement_source) for requirement in extracted_rfq.requirements],
        lots=[Lot(title=lot.title, description=lot.description, requirements=[Requirement(requirement=requirement.requirement, requirement_source=requirement.requirement_source) for requirement in lot.requirements], lot_source=lot.lot_source) for lot in extracted_rfq.lots]
    )

