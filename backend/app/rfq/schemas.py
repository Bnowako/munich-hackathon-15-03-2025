from pydantic import BaseModel

class RFQResponse(BaseModel):
    id: str
    title: str
    description: str
    requirements: list[str]
