from pydantic import BaseModel

class RequirementResponse(BaseModel):
    requirement: str
    requirement_source: str

class LotResponse(BaseModel):
    title: str
    description: str
    requirements: list[RequirementResponse]
    lot_source: str

class RFQResponse(BaseModel):
    id: str
    title: str
    description: str
    requirements: list[RequirementResponse]
    raw_xml: str
    lots: list[LotResponse]
