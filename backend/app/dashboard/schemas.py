from pydantic import BaseModel

class RFQStatusResponse(BaseModel):
    id: str
    title: str
    status: str
