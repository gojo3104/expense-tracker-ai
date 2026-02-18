# backend/routes/expense_routes.py
import os
from flask import Blueprint, request, current_app
from werkzeug.utils import secure_filename
from database import db
from models import Expense
from ocr_utils import extract_data, allowed_file
from app import success_response, error_response

expense_bp = Blueprint("expense_bp", __name__)

# ------------------------------------------------
# GET all expenses
# ------------------------------------------------
@expense_bp.route("/expenses", methods=["GET"])
def get_expenses():
    expenses = Expense.query.order_by(
        Expense.created_at.desc()
    ).all()
    return success_response([e.to_dict() for e in expenses])


# ------------------------------------------------
# ADD expense manually
# ------------------------------------------------
@expense_bp.route("/expenses", methods=["POST"])
def add_expense():
    data = request.get_json()
    if not data:
        return error_response("JSON body required")

    expense = Expense(
        merchant=data.get("merchant"),
        amount=data.get("amount"),
        date=data.get("date"),
        category=data.get("category", "Other"),
        raw_text=data.get("raw_text", "")
    )

    db.session.add(expense)
    db.session.commit()

    return success_response(expense.to_dict(), status=201)


# ------------------------------------------------
# UPLOAD receipt (OCR + SAVE)
# ------------------------------------------------
@expense_bp.route("/upload", methods=["POST"])
def upload_receipt():
    if "file" not in request.files:
        return error_response("No file provided")

    file = request.files["file"]
    if file.filename == "":
        return error_response("Empty filename")

    if not allowed_file(file.filename):
        return error_response("Unsupported file type")

    filename = secure_filename(file.filename)
    save_path = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
    file.save(save_path)

    try:
        parsed = extract_data(save_path)
    except Exception as e:
        print("OCR ERROR:", e)
        return error_response("OCR processing failed", status=500)

    expense = Expense(
        merchant=parsed["merchant"],
        amount=parsed["amount"],
        date=parsed["date"],
        category=parsed["category"],
        raw_text=parsed["raw_text"]
    )

    db.session.add(expense)
    db.session.commit()

    return success_response(expense.to_dict(), status=201)


# ------------------------------------------------
# UPDATE expense
# ------------------------------------------------
@expense_bp.route("/expenses/<int:expense_id>", methods=["PUT"])
def update_expense(expense_id):
    e = Expense.query.get_or_404(expense_id)
    data = request.get_json()
    if not data:
        return error_response("JSON body required")

    for field in ["merchant", "amount", "date", "category", "raw_text"]:
        if field in data:
            setattr(e, field, data[field])

    db.session.commit()
    return success_response(e.to_dict())


# ------------------------------------------------
# DELETE expense
# ------------------------------------------------
@expense_bp.route("/expenses/<int:expense_id>", methods=["DELETE"])
def delete_expense(expense_id):
    expense = Expense.query.get(expense_id)

    if not expense:
        return error_response("Expense not found", status=404)

    db.session.delete(expense)
    db.session.commit()

    return success_response({"deleted": True})
