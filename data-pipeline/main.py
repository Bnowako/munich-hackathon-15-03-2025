import asyncio
from pathlib import Path
from typing import Any, Dict
import xmltodict
import logging

import motor.motor_asyncio
from beanie import init_beanie # type: ignore

from typing import Any, Dict, Literal
from beanie import Document

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)


class RFQDocument(Document):
    type: Literal["ContractAwardNotice", "ContractNotice", "urn:ContractNotice", "PriorInformationNotice", "urn:ContractAwardNotice", "pin:PriorInformationNotice", "cn:ContractNotice", "can:ContractAwardNotice", "urn:PriorInformationNotice"]
    title: str
    description: str
    procurement_project_lot: list[Dict[str, Any]]
    cpv_codes: list[str]
    requirements: list[str]
    raw: str

async def init_db():
    # Create Motor client
    client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://localhost:27017") # type: ignore
    
    # Initialize beanie with the RFQ document model
    await init_beanie(database=client.db, document_models=[RFQDocument]) # type: ignore


def map_to_document(xml_dict: Dict[str, Any], xml_file: Path, raw: str) -> RFQDocument:
    rfq_type = list(xml_dict.keys())[0]
    
    if rfq_type not in ["ContractAwardNotice", "ContractNotice", "urn:ContractNotice", "PriorInformationNotice", "urn:ContractAwardNotice", "pin:PriorInformationNotice", "cn:ContractNotice", "can:ContractAwardNotice", "urn:PriorInformationNotice"]:
        raise ValueError(f"Invalid type: {rfq_type}")
    
    name_tag = xml_dict.get(rfq_type, {}).get('cac:ProcurementProject').get('cbc:Name')
    if isinstance(name_tag, list):
        name_tag = name_tag[0] # type: ignore
    
    logger.info(f"name_tag: {name_tag}")
    title = name_tag['#text'] # type: ignore
    if not title:
        logger.error(f"Title not found for {rfq_type} in {xml_file}")
        title = "unknown"
    
    description_tag = xml_dict.get(rfq_type, {}).get('cac:ProcurementProject').get('cbc:Description')
    if isinstance(description_tag, list):
        description_tag = description_tag[0] # type: ignore
    
    description = description_tag['#text'] # type: ignore
    if not description:
        logger.error(f"Description not found for {rfq_type} in {xml_file}")
        description = "unknown"

    project_procurement_lot = xml_dict.get(rfq_type, {}).get('cac:ProcurementProjectLot', [])
    if not isinstance(project_procurement_lot, list):
        project_procurement_lot = [project_procurement_lot]
    
    if not project_procurement_lot:
        logger.warn(f"Project procurement lot not found for {rfq_type}, {xml_file}")
        project_procurement_lot = []
    
    lot_cpv_codes = []
    for lot in project_procurement_lot: # type: ignore
        lot_tag = lot.get('cac:ProcurementProject', {}).get('cac:MainCommodityClassification', {}).get('cbc:ItemClassificationCode') # type: ignore
        if lot_tag is not None:
            lot_cpv = lot_tag["#text"] # type: ignore
            lot_cpv_codes.append(lot_cpv) # type: ignore

    return RFQDocument(
        type=rfq_type, # type: ignore
        title=title, # type: ignore
        description=description, # type: ignore
        
        cpv_codes=lot_cpv_codes, # type: ignore
        procurement_project_lot=project_procurement_lot, #type: ignore
        
        requirements=["todo"],
        
        raw=raw
    )


all_types: set[str] = set()

async def parse_xml_files(folder: str, max_files: int = 10):
    folder_path = Path(folder)
    logger.info(f"absolute path: {folder_path.absolute()}")
    
    result: list[RFQDocument] = []
    for i, xml_file in enumerate(folder_path.glob('*.xml')):
        if i >= max_files:
            break

        with xml_file.open('r', encoding='utf-8') as f:
            raw_xml = f.read()
            xml_dict = xmltodict.parse(raw_xml)

            rfq_document = map_to_document(xml_dict, xml_file, raw_xml)


            
            result.append(rfq_document)
            
    return result


async def main():
    await init_db()
    docs = await parse_xml_files('/Users/blazejnowakowski/Projects/munich-hackathon-15-03-2025/backend/resources/rfqs', max_files=50)

    # for doc in docs:
    #     logger.info(f"Inserting document: {doc.title}")
    #     await doc.insert()



if __name__ == "__main__":
    asyncio.run(main())
