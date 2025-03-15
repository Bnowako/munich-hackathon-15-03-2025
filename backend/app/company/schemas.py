from pydantic import BaseModel

class Company(BaseModel):
    name: str
    facts: list[str]

    def get_llm_context(self) -> str:
        facts_str = "\n".join(f"• {fact}" for fact in self.facts)
        return f"Company: {self.name}\nFacts:\n{facts_str}"