from typing import List, Literal
from pydantic import BaseModel
from langchain_openai import ChatOpenAI


class FactsUpdate(BaseModel):
    facts: List[str]
    reason: str


llm = ChatOpenAI(model="gpt-4o", temperature=0.1)
llm_evaluation = llm.with_structured_output(FactsUpdate)  # type: ignore


async def llm_update_company_facts(
    facts: List[str], reason: str, updated_reason: str
) -> FactsUpdate:
    prompt = f"""
                                          You are a helpful assistant that updates the facts of a company.
                                          The company has the following facts: {facts}
                                          
                                          There were some evaluations done that were not correct. User has provided a reason for the update and the updated reason.
                                          The reason for the update is: {reason}

                                          The updated reason is: {updated_reason}
                                          Please update the facts of the company.
                                          You should only update the facts that are related to the updated reason.
                                          """
    
    result = await llm_evaluation.ainvoke(prompt)  # type: ignore
    return result  # type: ignore

async def llm_update_company_facts_with_running_text(
    facts: List[str], running_text: str
) -> FactsUpdate:
    prompt = f"""
                                          You are a helpful assistant that updates the facts of a company.
                                          The company has the following facts: {facts}
                                          
                                          The user has provided information about the company. 
                                          The running text is: {running_text}

                                          Please add and update the existing facts of the company with this information.
                                          For complex information, or bullet points, split it into multiple facts.
                                          Return the complete list of updated facts.
                                          If the running text is not related to the facts, return the existing facts.
                                          """
    
    result = await llm_evaluation.ainvoke(prompt)  # type: ignore
    return result  # type: ignore
