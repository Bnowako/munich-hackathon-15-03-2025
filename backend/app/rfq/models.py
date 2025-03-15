from beanie import Document

class RFQDocument(Document):
    title: str
    description: str
    requirements: list[str]
    raw: str

    
    
