from app.company.models import CompanyDocument
from bson import ObjectId

async def get_company_context(id: str) -> str:
    company = await CompanyDocument.find_one(CompanyDocument.id == ObjectId(id))
    return f"Company: {company.name} Facts: {company.facts}"
