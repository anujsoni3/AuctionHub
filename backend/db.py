from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
SECRET_KEY =os.getenv("SECRET_KEY")
DB_NAME = os.getenv("DB_NAME")