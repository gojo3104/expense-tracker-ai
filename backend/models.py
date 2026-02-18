# backend/models.py
from database import db
from datetime import datetime

class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    merchant = db.Column(db.String(120))
    amount = db.Column(db.Float)
    date = db.Column(db.String(20))
    category = db.Column(db.String(50))
    raw_text = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "merchant": self.merchant,
            "amount": self.amount,
            "date": self.date,
            "category": self.category,
            "raw_text": self.raw_text,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }
