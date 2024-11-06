from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from sqlalchemy.future import select
from sqlalchemy import func, desc
from app.core.logging import logging
from app.models.hostels_model import Hostel
from app.schemas.hostels_schemas import HostelCreateModel, HosteUpdateModel


async def generate_Hostel_id(db: AsyncSession) -> str:
    try:
        result = await db.execute(select(Hostel.id).order_by(desc(Hostel.id)).limit(1))
        last_hostel = result.scalar_one_or_none()
        new_id = (last_hostel + 1) if last_hostel is not None else 1
        logging.info(f"Generated new Hostel ID: Hostel_{new_id}")
        return f"Hostel_{new_id}"
    except Exception as e:
        logging.error(f"Error generating Hostel ID: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail="Error generating Hostel ID")


async def create_hostel(db: AsyncSession, hostel_data: HostelCreateModel):
    try:
        hostels = []
        if not hostel_data.names:
            raise HTTPException(status_code=400, detail="No hostel names provided.")

        for name in hostel_data.names:
            new_hostel_id = await generate_Hostel_id(db)
            new_hostel = Hostel(
                hostel_id=new_hostel_id,
                name=name,
                is_active=hostel_data.is_active,
            )
            db.add(new_hostel)
            hostels.append(new_hostel)

        await db.commit()
        for hostel in hostels:
            await db.refresh(hostel)
        logging.info(f"Successfully created {len(hostels)} hostels.")
        return hostels
    except Exception as e:
        logging.error(f"Failed to create hostels: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create hostels")


async def get_all_hostels(db: AsyncSession, skip: int = 0, limit: int = 10):
    try:
        result = await db.execute(
            select(Hostel)
            .where(Hostel.is_active == True)
            .order_by(Hostel.id.desc())
            .offset(skip)
            .limit(limit)
        )
        hostels = result.scalars().all()
        # Get the total count of active Hostels
        total_count_result = await db.execute(select(func.count(Hostel.id)).where(Hostel.is_active == True))
        total_count = total_count_result.scalar()
        logging.info("Successfully retrieved all active hostels.")
        return hostels, total_count
    except Exception as e:
        logging.error(f"Failed to fetch hostels: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch hostels")

async def get_hostel_by_id(db: AsyncSession, hostel_id: int):
    try:
        hostel = await db.get(Hostel, hostel_id)
        if not hostel:
            logging.warning(f"Hostel with ID {hostel_id} not found.")
            return None
        logging.info(f"Hostel found: {hostel.name}")
        return hostel
    except Exception as e:
        logging.error(f"Error retrieving hostel by ID {hostel_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error retrieving hostel")
    
async def update_hostel(db: AsyncSession, hostel_id: int, hostel_data: HosteUpdateModel):
    try:
        hostel = await get_hostel_by_id(db, hostel_id)
        if not hostel:
            logging.warning(f"Hostel with ID {hostel_id} not found.")
            return None
        # Update fields if they are provided
        if hostel_data.name is not None:
            hostel.name = hostel_data.name
        if hostel_data.is_active is not None:
            hostel.is_active = hostel_data.is_active
        # Commit changes to the database
        await db.commit()
        await db.refresh(hostel)
        logging.info(f"Hostel with ID {hostel_id} updated successfully.")
        return hostel
    except Exception as e:
        logging.error(f"Failed to update hostel with ID {hostel_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to update hostel")
    

async def soft_delete_hostel(db: AsyncSession, hostel_id: int):
    try:
        hostel = await get_hostel_by_id(db, hostel_id)
        if not hostel:
            logging.warning(f"Hostel with ID {hostel_id} not found for soft delete.")
            return None
        # Set is_active to False for soft delete
        hostel.is_active = False
        await db.commit()
        await db.refresh(hostel)
        logging.info(f"Hostel with ID {hostel_id} soft deleted successfully.")
        return hostel
    except Exception as e:
        logging.error(f"Failed to soft delete hostel with ID {hostel_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to soft delete hostel")