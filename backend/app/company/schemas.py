from pydantic import BaseModel

class CompanyCreate(BaseModel):
    name: str
    facts: list[str]

class CompanyUpdate(BaseModel):
    name: str
    facts: list[str]

class CompanyUpdateWithRunningText(BaseModel):
    running_text: str

class CompanyResponse(BaseModel):
    id: str
    name: str
    facts: list[str]