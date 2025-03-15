from typing import List, Literal
from pydantic import BaseModel
from langchain_openai import ChatOpenAI

LLMEvaluationType = Literal["ELIGIBLE", "NOT_ELIGIBLE", "UNKNOWN"]



class LLMEvaluation(BaseModel):
    evaluation: LLMEvaluationType
    reason: str


llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1)
llm_evaluation = llm.with_structured_output(LLMEvaluation) # type: ignore


async def evaluate_requirement(requirement: str, context: str) -> LLMEvaluation:
    result = await llm_evaluation.ainvoke(f"Evaluate the following requirement: {requirement} in the context of the following context: {context}") # type: ignore
    return result # type: ignore





