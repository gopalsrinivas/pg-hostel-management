from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.core.database import Base


class Hostel(Base):
    __tablename__ = 'hostel'

    id = Column(Integer, primary_key=True, autoincrement=True)
    hostel_id = Column(String(50), nullable=False, unique=True)
    name = Column(String(150))
    is_active = Column(Boolean, default=False)
    created_on = Column(DateTime, default=func.now(), nullable=False)
    updated_on = Column(DateTime, onupdate=func.now(), default=None)

    def __repr__(self):
        return f"<Hostel {self.name} (ID: {self.hostel_id}) created on {self.created_on}>"
