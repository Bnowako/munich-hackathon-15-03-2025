import asyncio
import logging
from pathlib import Path
from typing import Any, Dict, List
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from pydantic import BaseModel
import xmltodict
from config import init_db
from models import ExtractedEnhancedRFQ, RFQDocument, map_extracted_rfq_to_rfq_document

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

load_dotenv()


llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1)

general_structured = llm.with_structured_output(ExtractedEnhancedRFQ) # type: ignore

async def main(save_to_db: bool = False):
    await init_db()
    logger.info("\n --- Starting main --- \n")
    
    docs = await RFQDocument.find_all().limit(5).to_list()
    for doc in docs:
       
        logger.info("Extracting general information about the RFQ and the lots. Here is the XML")
        general_structured_output = await general_structured.ainvoke(f"""
                                                                     You are RFQ EU Specialist. You are given a document with RFQ. You need to extract information about the RFQ and the lots. Here is the XML: {doc.parsed.raw_xml}
                                                        Tips about the extraction:
                                                        - Everything needs to be translated to ENGLISH
                                                        - We are preparing human readable easy to understand RFQ for the customer.
                                                        - First you need to extract general information about the RFQ and general requirements.
                                                        - Then you need to extract information about lots and their requirements.
                                                        - Requirements are things that the supplier needs to provide to take part in the RFQ.


                                                        Focused Guidelines on Extracting Requirements
	1.	Identify Requirement Statements:
	•	Keywords and Phrases:
	•	Look for words such as “must,” “shall,” “required,” “obligated,” “mandatory,” and “criteria.”
	•	Requirements often begin with these words or follow conditional statements.
	•	Contextual Clues:
	•	Determine if the statement specifies conditions, qualifications, or necessary standards that the company must meet.
	•	Highlight any financial, technical, or operational criteria that are critical.
	2.	Extracting the Requirement Text:
	•	Accuracy:
	•	Ensure that you capture the complete text of the requirement. Avoid truncation that might lose essential details.
	•	Clarity:
	•	Remove any extraneous XML markup or comments so that the requirement is in clear, plain language.
	•	Maintain Integrity:
	•	If a requirement is spread across multiple XML nodes, merge them carefully to preserve the intended meaning.
	3.	Documenting the Source of the Requirement:
	•	Reference Details:
	•	Record where the requirement came from within the XML (e.g., XML element name, attribute value, or document line number).
	•	Traceability:
	•	This reference should be stored in the requirement_source field to allow backtracking if further clarification is needed.
	4.	Validating Requirement Relevance:
	•	Company Fit:
	•	Ensure that each requirement is truly a condition that impacts whether the company can participate. This might include financial criteria, certifications, compliance standards, experience requirements, etc.
	•	Duplicate Handling:
	•	Check for repeated or similar requirements and decide whether to consolidate them or list them separately based on subtle differences in context.
	5.	Structuring Requirements within the Models:
	•	Global vs. Lot-specific:
	•	Global requirements that affect the entire RFQ should be added to the requirements list of the ExtractedEnhancedRFQ.
	•	Lot-specific requirements should be added to the corresponding ExtractedLot’s requirements list.
	•	Consistent Format:
	•	For every requirement, ensure that you create an ExtractedRequirement object with both the requirement text and its source.

                                                                     """) # type: ignore
        
        logger.info(f"General structured output: Done!")
        doc.enhanced = map_extracted_rfq_to_rfq_document(general_structured_output) # type: ignore
        await doc.save()

    # logger.info(f"Found {len(docs)} documents")


    



if __name__ == "__main__":
    
    asyncio.run(main())
