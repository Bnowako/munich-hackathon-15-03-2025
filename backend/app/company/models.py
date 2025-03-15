from beanie import Document

class CompanyDocument(Document):
    name: str
    facts: list[str]
