# pg-hostel-management
Technologies: Python with FastAPI, React with nextjs14, PostgreSQL etc

# Generate new secret key
import secrets
SECRET_KEY=secrets.token_urlsafe(33)
print(SECRET_KEY)

# Alembic

# Reinitialize Alembic
alembic init alembic

# Stop the Alembic service (if running)
# Remove old migration versions
rm -rf alembic/versions/*

# Drop the version table (make sure you have backups and you are in the correct environment)
SELECT * FROM alembic_version;
DROP TABLE alembic_version;

# Create a new migration script
alembic revision --autogenerate -m "Initial migration"

# Apply the migration to the database
alembic upgrade head