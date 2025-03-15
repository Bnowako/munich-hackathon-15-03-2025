from beanie import Document
from pydantic import Field
from bson import ObjectId

class RFQDocument(Document):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    title: str
    description: str
    requirements: list[str]
    raw: str

    
    
