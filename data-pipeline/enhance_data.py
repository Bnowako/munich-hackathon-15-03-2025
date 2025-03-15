import asyncio
import logging
from pathlib import Path
from typing import Any, Dict, List
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from pydantic import BaseModel
import xmltodict
from config import init_db
from models import EnhancedRFQ, ParsedXmlRfQ, RFQDocument, Requirement

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

load_dotenv()

class TranslatedText(BaseModel):
    text: str

class ExtractedRequirement(BaseModel):
    requirement: str
    requirement_source: str

class Requirements(BaseModel):
    requirements: List[ExtractedRequirement]
    

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1)
translation_chat = llm.with_structured_output(TranslatedText) # type: ignore
requirements_chat = llm.with_structured_output(Requirements) # type: ignore

async def main(save_to_db: bool = False):
    await init_db()
    logger.info("\n --- Starting main --- \n")

    
    docs = await RFQDocument.find_all().limit(5).to_list()
    for doc in docs:
        translated_title: TranslatedText = await translation_chat.ainvoke(f"Translate this to english: {doc.parsed.title}") # type: ignore
        translated_description: TranslatedText = await translation_chat.ainvoke(f"Translate this to english: {doc.parsed.description}") # type: ignore
        requirements: Requirements = await requirements_chat.ainvoke(f"Extract requirements from this document add exact source of the requirement that is in the xml: {doc.parsed.raw_xml}") # type: ignore
        doc.enhanced = EnhancedRFQ(
            title=translated_title.text,
            description=translated_description.text,
            requirements=[
                Requirement(
                requirement=requirement.requirement, 
                requirement_source=requirement.requirement_source
                ) for requirement in requirements.requirements
                ]
        )
        await doc.save()

    # logger.info(f"Found {len(docs)} documents")


    



if __name__ == "__main__":
    
    asyncio.run(main())
