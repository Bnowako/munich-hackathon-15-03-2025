import asyncio
import logging
from pathlib import Path
from typing import Any, Dict, List
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from pydantic import BaseModel
import xmltodict
from config import init_db
from models import EnhancedRFQ, Lot, ParsedXmlRfQ, RFQDocument, Requirement

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

class ExtractedLot(BaseModel):
    title: str
    description: str
    requirements: List[ExtractedRequirement]


llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1)

general_structured = llm.with_structured_output(EnhancedRFQ) # type: ignore

async def main(save_to_db: bool = False):
    await init_db()
    logger.info("\n --- Starting main --- \n")
    
    docs = await RFQDocument.find_all().limit(5).to_list()
    for doc in docs:
       
        logger.info(f"Extracting general information about the RFQ and the lots. Here is the XML: {doc.parsed.raw_xml}")
        general_structured_output = await general_structured.ainvoke(f"""
                                                                     You are RFQ EU Specialist. You are given a document with RFQ. You need to extract information about the RFQ and the lots. Here is the XML: {doc.parsed.raw_xml}
                                                        Tips about the extraction:
                                                        - Everything needs to be translated to ENGLISH
                                                        - We are preparing human readable easy to understand RFQ for the customer.
                                                        - First you need to extract general information about the RFQ and general requirements.
                                                        - Then you need to extract information about lots and their requirements.
                                                                     """) # type: ignore
        
        logger.info(f"General structured output: Done!")
        doc.enhanced = general_structured_output # type: ignore
        await doc.save()

    # logger.info(f"Found {len(docs)} documents")


    



if __name__ == "__main__":
    
    asyncio.run(main())
