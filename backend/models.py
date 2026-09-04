from sqlalchemy import Column, Integer, String, Text, ForeignKey
from backend.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    dietary_condition = Column(String, default="None")  # e.g., "Diabetic", "Hypertension"

class ScanLog(Base):
    __tablename__ = "scan_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_name = Column(String)
    nova_level = Column(Integer)
    verdict = Column(Text)