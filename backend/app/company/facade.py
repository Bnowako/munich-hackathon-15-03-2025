from app.company.models import Company

def get_company_context(id: str) -> str:
    company = get_company_by_id(id)
    return "Company: Railway Co. Facts: Railway Co. is a railway company that builds railways and sells railway tickets."
