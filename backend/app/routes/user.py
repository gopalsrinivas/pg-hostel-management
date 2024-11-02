from pathlib import Path
import os
import logging
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, status, Request, Query, UploadFile, File, Form
from app.core.logging import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.services.user import create_user, authenticate_user, get_user_details, update_user_details, update_user_details
from app.schemas.user import UserCreate
from app.core.security import create_access_token, create_refresh_token, get_current_user
from app.utils.send_notifications.send_otp import verify_otp
from app.models.user import User
import random
from app.utils.send_notifications.send_otp import send_otp_email
from fastapi.security import OAuth2PasswordRequestForm
from jwt import ExpiredSignatureError, InvalidTokenError
from app.core.security import *
from app.core.config import MEDIA_DIR
from typing import Optional


router = APIRouter()


@router.post("/", response_model=dict, summary="Create new User Registration")
async def register_user(user: UserCreate, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    try:
        new_user = await create_user(db, user.name, user.email, user.mobile, user.password,user.user_role, background_tasks)
        logging.info(f"User registered successfully: {new_user.user_id}")

        return {
            "status_code": 200,
            "message": "User registered successfully. Please verify OTP sent to your email.",
            "access_token": new_user.access_token,
            "refresh_token": new_user.refresh_token,
            "user_data": {
                "id": new_user.id,
                "user_id": new_user.user_id,
                "name": new_user.name,
                "mobile": new_user.mobile,
                "is_active": new_user.is_active,
                "otp": new_user.otp,
                "verified_at": new_user.verified_at,
                "created_on": new_user.created_on,
                "updated_on": new_user.updated_on,
            }
        }

    except HTTPException as http_ex:
        logging.error(f"HTTP Exception during user registration: {
                      http_ex.detail}")
        raise http_ex
    except Exception as ex:
        logging.error(f"Unexpected error during user registration: {str(ex)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/verify-otp/", response_model=dict, summary="Verify OTP for User Activation")
async def verify_user_otp(id: int, otp: str, db: AsyncSession = Depends(get_db)):
    try:
        # Query user by ID
        user = await db.execute(select(User).filter(User.id == id))
        user = user.scalar_one_or_none()
        
        # Verify the USER
        if not user:
            logging.error(f"User not found with user_id: {id}")
            raise HTTPException(status_code=404, detail="User not found")

        # Verify the OTP
        if not await verify_otp(user.email, otp):
            logging.warning(f"Invalid OTP for user: {user.id}")
            raise HTTPException(status_code=400, detail="Invalid OTP")

        # Activate the user
        user.is_active = True
        user.verified_at = datetime.utcnow()
        await db.commit()
        await db.refresh(user)

        logging.info(f"User {id} verified successfully.")

        # Return success message and tokens
        return {
            "status_code": 200,
            "message": "User verified successfully and activated.",
            "data": {
                "access_token": user.access_token,
                "refresh_token": user.refresh_token,
                "user_data": {
                    "id": user.id,
                    "user_id": user.user_id,
                    "name": user.name,
                    "mobile": user.mobile,
                    "is_active": user.is_active,
                    "otp": user.otp,
                    "verified_at": user.verified_at,
                    "created_on": user.created_on,
                    "updated_on": user.updated_on,
                }
            }
        }
    except HTTPException as http_ex:
        logging.error(f"HTTP Exception during OTP verification for id {id}: {http_ex.detail}")
        raise http_ex
    except Exception as ex:
        logging.error(f"Unexpected error during OTP verification for id {id}: {str(ex)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred during OTP verification")


@router.post("/resend-otp/", response_model=dict, summary="Resend OTP for User")
async def resend_otp(
    id: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    try:
        # Fetch user from the database
        user_result = await db.execute(select(User).filter(User.id == id))
        user = user_result.scalar_one_or_none()

        # Check if the user exists
        if not user:
            logging.error(f"User not found with id: {id}")
            raise HTTPException(status_code=404, detail="User not found")

        # Check if the user is already active
        if user.is_active:
            logging.warning(f"Attempt to resend OTP for an already active user: {id}")
            raise HTTPException(status_code=400, detail="User is already active")
            

        # Generate a new 6-digit OTP
        otp_code = str(random.randint(100000, 999999))
        user.otp = otp_code

        # Update the user in the database
        db.add(user)
        await db.commit()
        await db.refresh(user)

        # Send OTP email in the background
        await send_otp_email(background_tasks, user.name, user.email, otp_code)

        logging.info(f"Resent OTP to {user.email}")

        # Prepare the response
        return {
            "status_code": 200,
            "message": "New OTP sent to your email.",
            "access_token": user.access_token,
            "refresh_token": user.refresh_token,
            "user_data": {
                "id": user.id,
                "user_id": user.user_id,
                "name": user.name,
                "mobile": user.mobile,
                "is_active": user.is_active,
                "otp": user.otp,
                "verified_at": user.verified_at,
                "created_on": user.created_on,
                "updated_on": user.updated_on,
            }
        }
    except HTTPException as http_ex:
        logging.error(f"HTTP Exception during OTP resend: {http_ex.detail}")
        raise http_ex
    except Exception as ex:
        logging.error(f"Unexpected error during OTP resend: {str(ex)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    

@router.post("/login/", summary="Login for User")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    try:
        # Authenticate user and get the response
        auth_response = await authenticate_user(db, form_data.username, form_data.password)

        if auth_response['status'] == "error":
            logging.warning(f"Login failed for user: {form_data.username}. {auth_response['msg']}")
            raise HTTPException(status_code=400, detail=auth_response['msg'])

        user = auth_response['data']

        # Check if the user has existing tokens
        if user.access_token and user.refresh_token:
            return {
                "status": "success",
                "msg": "Login successful.",
                "access_token": user.access_token,
                "refresh_token": user.refresh_token,
                "user_data": {
                    "id": user.id,
                    "user_id": user.user_id,
                    "name": user.name,
                    "profile_image": user.profile_image,
                    "user_role": user.user_role,
                    "bio": user.bio,
                    "email": user.email,
                    "mobile": user.mobile,
                    "is_active": user.is_active,
                    "otp": user.otp,
                    "verified_at": user.verified_at,
                    "created_on": user.created_on.isoformat(),
                    "updated_on": user.updated_on.isoformat() if user.updated_on else None,
                }
            }

        # Generate new tokens if not found
        access_token = create_access_token(data={"sub": user.user_id})
        refresh_token = create_refresh_token(data={"sub": user.user_id})

        # Update the user with new tokens
        user.access_token = access_token
        user.refresh_token = refresh_token
        await db.commit()

        return {
            "status": "success",
            "msg": "Login successful. New tokens generated.",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user_data": {
                "id": user.id,
                "user_id": user.user_id,
                "name": user.name,
                "profile_image": user.profile_image,
                "user_role": user.user_role,
                "bio": user.bio,
                "email": user.email,
                "mobile": user.mobile,
                "is_active": user.is_active,
                "otp": user.otp,
                "verified_at": user.verified_at,
                "created_on": user.created_on.isoformat(),
                "updated_on": user.updated_on.isoformat() if user.updated_on else None,
            }
        }
    except HTTPException as http_ex:
        # If an HTTPException occurs, log the error but don't raise a new one
        logging.error(f"HTTP Exception during login process: {str(http_ex)}")
        raise http_ex
    except Exception as ex:
        logging.error(f"Unexpected error during login process: {str(ex)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    

@router.get("/me/", response_model=dict, summary="Get details of the authenticated user")
async def get_authenticated_user(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        user_details = await get_user_details(db, current_user.user_id)

        if not user_details.is_active:
            logging.warning(f"User {current_user.id} is inactive.")
            raise HTTPException(status_code=403, detail="User account is inactive")

        return {
            "msg": "User details fetched successfully.",
            "status": "success",
            "data": {
                "id": user_details.id,
                "user_id": user_details.user_id,
                "name": user_details.name,
                "profile_image": user_details.profile_image,
                "user_role": user_details.user_role,
                "bio": user_details.bio,
                "email": user_details.email,
                "mobile": user_details.mobile,
                "is_active": user_details.is_active,
                "otp": user_details.otp,
                "verified_at": user_details.verified_at.isoformat(),
                "created_on": user_details.created_on.isoformat(),
                "updated_on": user_details.updated_on.isoformat() if user_details.updated_on else None,
            }
        }
    except HTTPException as http_ex:
        logging.error(
            f"HTTP Exception fetching authenticated user details: {str(http_ex)}")
        raise http_ex
    except Exception as ex:
        logging.error(f"Error fetching authenticated user details: {str(ex)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.put("/update_me/", response_model=dict, summary="Update details of the authenticated user")
async def update_authenticated_user(
    request: Request,
    name: str = Form(...),
    bio: Optional[str] = Form(None),
    email: str = Form(...),
    mobile: str = Form(...),
    is_active: bool = Form(...),
    profile_image: UploadFile = Form(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Log received input values for debugging, including profile_image
    logging.info(f"Received input: name={name}, bio={bio}, email={email}, mobile={mobile}, is_active={is_active}, profile_image={profile_image.filename if profile_image else 'None'}")

    # Ensure profile_image is provided and valid
    if not profile_image or not profile_image.filename:
        logging.error("Profile image is required but not provided.")
        raise HTTPException(status_code=400, detail="Profile image is required")

    # Prepare user data dictionary
    user_data = {
        "name": name,
        "bio": bio,
        "email": email,
        "mobile": mobile,
        "is_active": is_active
    }

    # Call the service layer function to update user details
    updated_user = await update_user_details(db, current_user.user_id, user_data, file=profile_image)

    # Construct the profile image URL using the base URL and media path
    profile_image_url = f"{request.base_url}media/{updated_user.profile_image}"

    return {
        "msg": "User details updated successfully.",
        "status_code": 200,
        "data": {
            "id": updated_user.id,
            "user_id": updated_user.user_id,
            "name": updated_user.name,
            "email": updated_user.email,
            "mobile": updated_user.mobile,
            "user_role": updated_user.user_role,
            "bio": updated_user.bio,
            "is_active": updated_user.is_active,
            "profile_image": profile_image_url,
            "verified_at": updated_user.verified_at.isoformat() if updated_user.verified_at else None,
            "created_on": updated_user.created_on.isoformat(),
            "updated_on": updated_user.updated_on.isoformat(),
        }
    }
