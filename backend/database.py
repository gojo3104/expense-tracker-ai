# backend/database.py
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_db(app):
    # create tables if not exist
    with app.app_context():
        db.create_all()
