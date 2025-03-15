import asyncio
from pathlib import Path
from typing import Any, Dict
from pydantic import BaseModel
import xmltodict
import logging

import motor.motor_asyncio
from beanie import init_beanie # type: ignore

from typing import Any, Dict, Literal
from beanie import Document

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

class ParsedXmlRfQ(BaseModel):
    type: Literal["ContractAwardNotice", "ContractNotice", "urn:ContractNotice", "PriorInformationNotice", "urn:ContractAwardNotice", "pin:PriorInformationNotice", "cn:ContractNotice", "can:ContractAwardNotice", "urn:PriorInformationNotice"]
    title: str
    description: str
    procurement_project_lot: list[Dict[str, Any]]
    cpv_codes: list[str]
    raw_xml: Dict[str, Any]

class EnhancedRFQ(BaseModel):
    title: str
    description: str
    requirements: list[str]


class RFQDocument(Document):
    parsed: ParsedXmlRfQ
    enhanced: EnhancedRFQ | None = None

async def init_db():
    # Create Motor client
    client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://localhost:27017") # type: ignore
    
    # Initialize beanie with the RFQ document model
    await init_beanie(database=client.db, document_models=[RFQDocument]) # type: ignore


def map_to_document(xml_dict: Dict[str, Any], xml_file: Path, raw: str) -> ParsedXmlRfQ:
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

    return ParsedXmlRfQ(
        type=rfq_type, # type: ignore
        title=title, # type: ignore
        description=description, # type: ignore
        
        cpv_codes=lot_cpv_codes, # type: ignore
        procurement_project_lot=project_procurement_lot, #type: ignore
        
        raw_xml=xml_dict
    )


all_types: set[str] = set()

async def parse_xml_files(folder: str, max_files: int = 10):
    folder_path = Path(folder)
    logger.info(f"absolute path: {folder_path.absolute()}")
    
    result: list[ParsedXmlRfQ] = []
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
    pased_rfqs = await parse_xml_files('resources', max_files=50)

    # for i, rfq in enumerate(pased_rfqs):
        # logger.info(f"Inserting document number {i}: {rfq.title}")
        # doc = RFQDocument(parsed=rfq)
        # await doc.insert()



if __name__ == "__main__":
    asyncio.run(main())
