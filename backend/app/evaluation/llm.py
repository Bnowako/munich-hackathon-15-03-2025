from typing import List, Literal
from pydantic import BaseModel
from langchain_openai import ChatOpenAI

LLMEvaluationType = Literal["ELIGIBLE", "NOT_ELIGIBLE", "UNKNOWN"]



class LLMEvaluation(BaseModel):
    evaluation: LLMEvaluationType
    reason: str


llm = ChatOpenAI(model="gpt-4o", temperature=0.1)
llm_evaluation = llm.with_structured_output(LLMEvaluation) # type: ignore


async def evaluate_requirement(requirement: str, context: str) -> LLMEvaluation:
    prompt = f"""
    You are Evaluation Expert. You will be given a requirement and a context.
    Evaluate the following requirement: {requirement} in the context of the following context: {context}
    Mark the requirement as ELIGIBLE when it is relevant to the context.
    Mark the requirement as NOT_ELIGIBLE when it is not relevant to the context.
    Mark the requirement as UNKNOWN when there is no information about the requirement in the context.
    In the reason field just write what was missing. To not mention the obvious. Reson should have 1 sentance.

    Example:
    Don't write this: The context does not provide information about the company's compliance with exclusion grounds.
    Write this: Missing information about the company's compliance with exclusion grounds.
    """
    result = await llm_evaluation.ainvoke(prompt) # type: ignore
    return result # type: ignore





