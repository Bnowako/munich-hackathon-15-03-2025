import motor.motor_asyncio
from beanie import init_beanie # type: ignore

from models import RFQDocument
from dotenv import load_dotenv
import os

load_dotenv()

async def init_db():
    # Create Motor client
    client = motor.motor_asyncio.AsyncIOMotorClient(os.getenv("MONGO_DB_URL")) # type: ignore
    
    # Initialize beanie with the RFQ document model
    await init_beanie(database=client.db, document_models=[RFQDocument]) # type: ignore

