from typing import Any, Dict, Literal
from pydantic import BaseModel

from beanie import Document

EvaluationType = Literal["ELIGIBLE", "NOT_ELIGIBLE", "UNKNOWN", "IN_PROGRESS", "INITIAL"]

class RequirementEvaluation(BaseModel):
    evaluation: EvaluationType
    reason: str

class ParsedXmlRfQ(BaseModel):
    type: Literal["ContractAwardNotice", "ContractNotice", "urn:ContractNotice", "PriorInformationNotice", "urn:ContractAwardNotice", "pin:PriorInformationNotice", "cn:ContractNotice", "can:ContractAwardNotice", "urn:PriorInformationNotice"]
    title: str
    description: str
    procurement_project_lot: list[Dict[str, Any]]
    cpv_codes: list[str]
    raw_xml: str

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


class RFQDocument(Document):
    parsed: ParsedXmlRfQ
    enhanced: EnhancedRFQ | None = None