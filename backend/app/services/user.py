import os
from pathlib import Path
from app.core.logging import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import Request, HTTPException, BackgroundTasks, Depends, UploadFile
from app.core.security import verify_password, hash_password, create_access_token, create_refresh_token
from sqlalchemy import func, select, or_, desc, cast, String
from app.utils.send_notifications.send_otp import send_otp_email, send_reset_password_email
import random
from sqlalchemy.exc import SQLAlchemyError
from app.models.user import User
from app.core.config import MEDIA_DIR, PROFILE_IMAGES_DIR
from typing import Optional
import shutil


DEFAULT_IMAGE = "default_profile.jpg" 

async def generate_user_id(db: AsyncSession) -> str:
    try:
        # Query to get the last inserted ID from the User table
        result = await db.execute(select(User.id).order_by(desc(User.id)).limit(1))
        # Get the last user ID
        last_user = result.scalar_one_or_none()
        # Calculate the new ID
        new_id = (last_user + 1) if last_user is not None else 1
        # Log the generated user ID
        logging.info(f"Generated new user ID: user_{new_id}")
        # Return the new user ID in the desired format
        return f"user_{new_id}"
    except Exception as e:
        logging.error(f"Error generating user ID: {str(e)}")
        raise HTTPException(status_code=500, detail="Error generating user ID")


async def create_user(db: AsyncSession, name: str, email: str, mobile: str, password: str, user_role:str, background_tasks: BackgroundTasks) -> User:
    try:
        # Check if the email already exists
        existing_email = await db.execute(select(User).filter(User.email == email))
        if existing_email.scalar_one_or_none():
            logging.warning(f"Registration attempt with existing email: {email}")
            raise HTTPException(status_code=400, detail="Email already exists")

        # Check if the mobile number already exists
        existing_mobile = await db.execute(select(User).filter(User.mobile == mobile))
        if existing_mobile.scalar_one_or_none():
            logging.warning(f"Registration attempt with existing mobile number: {mobile}")
            raise HTTPException(status_code=400, detail="Mobile number already exists")

        # Generate new user ID
        user_id = await generate_user_id(db)

        # Hash the password
        hashed_password = hash_password(password)
        logging.info(f"Password hashed successfully for user: {name}")

        # Generate a random 6-digit OTP
        otp_code = str(random.randint(100000, 999999))

        # Create new user instance
        new_user = User(
            user_id=user_id,
            user_role=user_role,
            name=name,
            email=email,
            mobile=mobile,
            password=hashed_password,
            is_active=False,
            otp=otp_code
        )

        # Add user to the database
        db.add(new_user)

        # Create tokens
        access_token = create_access_token(data={"sub": new_user.user_id})
        refresh_token = create_refresh_token(data={"sub": new_user.user_id})
        logging.info(f"Tokens created: {access_token} -- {refresh_token}")

        # Store tokens in the user instance
        new_user.access_token = access_token
        new_user.refresh_token = refresh_token

        # Commit the transaction
        await db.commit()

        # Refresh the user instance with the latest data from the DB
        await db.refresh(new_user)

        logging.info(f"User created successfully: {new_user}")

        # Send OTP to the user’s email in the background
        logging.info(f"Preparing to send OTP email to {new_user.email} with code {otp_code}")
        await send_otp_email(background_tasks, new_user.name, new_user.email, otp_code)

        return new_user

    except HTTPException as e:
        logging.error(f"HTTP Exception occurred: {str(e)}")
        raise e

    except Exception as e:
        logging.error(f"Error occurred while creating user: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred during user creation")


async def authenticate_user(db: AsyncSession, username: str, password: str):
    try:
        # Check if the username is an email or a mobile number
        user_result = await db.execute(select(User).filter((User.email == username) | (User.mobile == username)))
        user = user_result.scalar_one_or_none()

        if not user:
            logging.warning(f"User {username} not found.")
            return {
                "status": "error",
                "msg": "User not found.",
                "data": None
            }

        if not verify_password(password, user.password):
            logging.warning(f"Password verification failed for user: {username}.")
            return {
                "status": "error",
                "msg": "Invalid password.",
                "data": None
            }

        # Check if the user is active
        if not user.is_active:
            logging.warning(f"User {username} is not active.")
            return {
                "status": "error",
                "msg": "User is not active.",
                "data": None
            }

        logging.info(f"User {username} authenticated successfully.")
        return {
            "status": "success",
            "msg": "User authenticated successfully.",
            "data": user
        }
    except SQLAlchemyError as db_error:
        logging.error(f"Database error during user authentication: {str(db_error)}")
        raise HTTPException(status_code=500, detail="Database Error")
    except Exception as ex:
        logging.error(f"Error during user authentication: {str(ex)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    
    
async def get_user_details(db: AsyncSession, user_id: str) -> User:
    try:
        user_result = await db.execute(select(User).filter(User.user_id == user_id))
        user = user_result.scalar_one_or_none()

        if not user:
            logging.warning(f"User not found: {user_id}.")
            raise HTTPException(status_code=404, detail="User not found")

        return user
    except Exception as ex:
        logging.error(f"Error fetching user details: {str(ex)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

async def update_user_details(db: AsyncSession, user_id: str, user_data: dict, file: UploadFile = None) -> User:
    try:
        # Retrieve user details from DB
        user = await get_user_details(db, user_id)
        if not user:
            logging.warning(f"User not found for update: {user_id}")
            raise HTTPException(status_code=404, detail="User not found")

        # Update user fields
        for key, value in user_data.items():
            logging.info(f"Updating field: {key} with value: {value}")
            setattr(user, key, value)

        # Handle the file upload if provided
        if file and file.filename:
            # Read the file content to check size
            file_size = len(await file.read())
            # Reset file pointer to the beginning for subsequent operations
            await file.seek(0)

            if file_size > 1 * 1024 * 1024:  # 1MB limit
                logging.error("Uploaded file size exceeds 1MB.")
                raise HTTPException(status_code=400, detail="Uploaded file size exceeds 1MB.")

            # Define the file name and location
            file_name = f"{user_id}_{file.filename}"
            # Store in profile_images
            file_location = os.path.join(PROFILE_IMAGES_DIR, file_name)
            logging.info(f"File Location: {file_location}")

            # If there's an existing profile image, delete it
            if user.profile_image and user.profile_image != "default_profile_image.jpg":
                existing_file_path = os.path.join(PROFILE_IMAGES_DIR, user.profile_image)
                if os.path.exists(existing_file_path):
                    os.remove(existing_file_path)
                    logging.info(f"Deleted existing profile image: {existing_file_path}")

            # Write the new file to the profile_images directory
            with open(file_location, "wb") as f:
                shutil.copyfileobj(file.file, f)

            # Store the new filename in the database
            user.profile_image = file_name
        else:
            logging.info(f"No new profile image provided for user_id: {user_id}")
            if not user.profile_image:
                user.profile_image = "default_profile_image.jpg"

        # Commit changes and refresh user data
        await db.commit()
        await db.refresh(user)

        logging.info(f"User details updated for user_id: {user_id}")
        return user

    except HTTPException as http_ex:
        logging.error(f"HTTP error occurred: {http_ex.detail}")
        raise http_ex

    except Exception as ex:
        logging.error(f"Unexpected error while updating user details: {str(ex)}")
        raise HTTPException(status_code=500, detail="Error updating user details")