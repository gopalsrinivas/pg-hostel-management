from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import JSONResponse
from app.core.database import get_db
from app.core.logging import logging
from sqlalchemy.future import select
from app.models.hostels_model import Hostel
from app.services.hostel_services import create_hostel, get_all_hostels, get_hostel_by_id, update_hostel, soft_delete_hostel
from app.schemas.hostels_schemas import HostelModel, HostelCreateModel, HosteUpdateModel

router = APIRouter()


@router.post("/", response_model=dict, summary="Create new Hostels")
async def create_hostel_route(
    hostel_data: HostelCreateModel, db: AsyncSession = Depends(get_db)
):
    try:
        # Check if any hostel names already exist
        existing_hostel = await db.execute(select(Hostel.name).where(Hostel.name.in_(hostel_data.names)))
        existing_names = existing_hostel.scalars().all()
        if existing_names:
            raise HTTPException(
                status_code=400,
                detail=f"Hostel names already exist: {', '.join(existing_names)}"
            )

        # Create new hostels (assuming this returns a list of Hostel objects)
        new_hostels = await create_hostel(db, hostel_data)
        logging.info(f"{len(new_hostels)} hostels created.")

        # Convert created hostels to a list of schemas and return
        return {
            "status_code": 201,
            "message": "Hostels created successfully",
            "data": [HostelModel.from_orm(hstl) for hstl in new_hostels]
        }
    except HTTPException as he:
        logging.error(f"HTTP error: {he.detail}")
        raise he
    except Exception as e:
        logging.error(f"Failed to create hostels: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create Hostels")


@router.get("/all/", response_model=dict, summary="List of Hostels")
async def get_categories_route(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, gt=0),
    db: AsyncSession = Depends(get_db)
):
    try:
        hostels, total_count = await get_all_hostels(db, skip=skip, limit=limit)
        logging.info("Successfully retrieved all hostels.")

        return {
            "status_code": 200,
            "message": "Hostels retrieved successfully",
            "total_count": total_count,
            "data": [HostelModel.from_orm(hostel) for hostel in hostels]
            
        }
    except Exception as e:
        logging.error(f"Failed to fetch Hostels: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch hostels")


@router.get("/{hostel_id}", response_model=dict, summary="Retrieve a Hostel by ID")
async def get_hostel_by_id_route(hostel_id: int, db: AsyncSession = Depends(get_db)):
    try:
        hostel = await get_hostel_by_id(db, hostel_id)
        if not hostel:
            raise HTTPException(status_code=404, detail="Hostel not found")

        logging.info(f"Hostel retrieved: {hostel.name}")
        return {
            "status_code": 200,
            "message": "Hostel retrieved successfully",
            "data": HostelModel.from_orm(hostel)
        }
    except HTTPException as he:
        logging.error(f"HTTP error: {he.detail}", exc_info=True)
        raise he
    except Exception as e:
        logging.error(f"Failed to fetch Hostel: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch hostel")


@router.put("/{hostel_id}", response_model=dict, summary="Update a Hostel by ID")
async def update_hostel_route(
    hostel_id: int, hostel_data: HosteUpdateModel, db: AsyncSession = Depends(get_db)
):
    try:
        updated_hostel = await update_hostel(db, hostel_id, hostel_data)
        if not updated_hostel:
            raise HTTPException(status_code=404, detail="Hostel not found")

        logging.info(f"Hostel updated: {updated_hostel.name or 'Unnamed'}")

        return {
            "status_code": 200,
            "message": "Hostel updated successfully",
            "data": HostelModel.from_orm(updated_hostel)
        }
    except HTTPException as he:
        logging.error(f"HTTP error: {he.detail}", exc_info=True)
        raise he
    except Exception as e:
        logging.error(f"Failed to update hostel: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to update hostel")

@router.delete("/{hostel_id}", response_model=dict, summary="Delete a hostels by ID")
async def delete_hostel_route(hostel_id: int, db: AsyncSession = Depends(get_db)):
    try:
        delete_hostel = await soft_delete_hostel(db, hostel_id)
        if not delete_hostel:
            raise HTTPException(status_code=404, detail="Hostel not found")

        logging.info(f"Hostel soft deleted with ID: {hostel_id}")
        return {
            "status_code": 200,
            "message": "Hostel soft deleted successfully",
            "data": {"id": delete_hostel.id, "name": delete_hostel.name,"is_active": delete_hostel.is_active}
        }

    except HTTPException as he:
        logging.error(f"HTTP error during deletion: {he.detail}")
        raise he

    except Exception as e:
        logging.error(f"Failed to soft delete hostel: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to soft delete hostel")