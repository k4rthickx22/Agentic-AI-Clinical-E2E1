"""DB migration: create users table and add user_id to consultations table."""
from database.db import engine
from sqlalchemy import text

def run_migration():
    with engine.connect() as conn:
        # Create users table if it doesn't exist
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR NOT NULL,
                email VARCHAR UNIQUE NOT NULL,
                hashed_password VARCHAR NOT NULL,
                role VARCHAR DEFAULT 'patient',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW(),
                last_login TIMESTAMP
            );
        """))

        # Add user_id to consultations if it doesn't exist
        conn.execute(text("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='consultations' AND column_name='user_id'
                ) THEN
                    ALTER TABLE consultations ADD COLUMN user_id INTEGER REFERENCES users(id);
                END IF;
            END $$;
        """))

        conn.commit()
        print("✅ Migration complete: users table created, user_id added to consultations.")

if __name__ == "__main__":
    run_migration()
