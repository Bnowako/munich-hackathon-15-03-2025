from beanie import Document
from pydantic import Field

class EvaluationDocument(Document):
    rfq_id: str
    requirements_to_notes: list[dict[str, str]] # {requirement: note}

    
    
