from beanie import Document
from pydantic import Field
from bson import ObjectId

class RFQDocument(Document):
    title: str
    description: str
    requirements: list[str]
    raw: str

    
