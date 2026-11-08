"""Create the first account directly in the configured database.

Usage: python create_user.py <username> <password> [admin|user]
This command fails if the database already contains an account.
"""
import sys

from sqlalchemy.exc import IntegrityError

from database import Base, engine, SessionLocal
from Auth import hash_password
from models import Users


def main():
    if len(sys.argv) not in (3, 4):
        raise SystemExit("Usage: python create_user.py <username> <password> [admin|user]")
    username, password = sys.argv[1:3]
    username = username.strip()
    if not username:
        raise SystemExit("Username cannot be empty")
    if not password:
        raise SystemExit("Password cannot be empty")
    role = sys.argv[3] if len(sys.argv) == 4 else "user"
    if role not in {"admin", "user"}:
        raise SystemExit("Role must be admin or user")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Users.id).first():
            raise SystemExit(
                "Only one account is allowed; an account already exists."
            )
        if db.query(Users).filter(Users.username == username).first():
            raise SystemExit(f"Username already exists: {username}")
        db.add(Users(username=username, password_hash=hash_password(password), role=role))
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise SystemExit(
                "Only one account is allowed; an account already exists."
            ) from None
        print(f"Created {role} account: {username}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
