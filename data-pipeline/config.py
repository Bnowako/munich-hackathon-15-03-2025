import motor.motor_asyncio
from beanie import init_beanie # type: ignore

from models import RFQDocument

async def init_db():
    # Create Motor client
    client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://localhost:27017") # type: ignore
    
    # Initialize beanie with the RFQ document model
    await init_beanie(database=client.db, document_models=[RFQDocument]) # type: ignore

