# backend/app.py
from flask import Flask, jsonify
from flask_cors import CORS
import os
from database import db
from models import Expense

def create_app():
    app = Flask(__name__)
    CORS(app)

    # ---- Paths ----
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    INSTANCE_DIR = os.path.join(BASE_DIR, "instance")
    os.makedirs(INSTANCE_DIR, exist_ok=True)

    DB_PATH = os.path.join(INSTANCE_DIR, "expense.db")

    app.config.update(
        SQLALCHEMY_DATABASE_URI=f"sqlite:///{DB_PATH}",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        UPLOAD_FOLDER=os.path.join(BASE_DIR, "upload"),
        MAX_CONTENT_LENGTH=5 * 1024 * 1024  # 5 MB max upload
    )

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # ---- Init DB ----
    db.init_app(app)
    with app.app_context():
        db.create_all()

    # ---- Register Routes ----
    from routes.expense_routes import expense_bp
    app.register_blueprint(expense_bp, url_prefix="/api")

    # ---- Health Check ----
    @app.route("/")
    def health():
        return success_response({"message": "Expense Tracker API running"})

    # ---- Global Error Handler ----
    @app.errorhandler(Exception)
    def handle_exception(e):
        app.logger.exception("Unhandled Exception")
        return error_response("Internal server error"), 500

    return app


# ---------- Standard API Responses ----------

def success_response(data=None, status=200):
    return jsonify({
        "success": True,
        "data": data,
        "error": None
    }), status


def error_response(message, status=400):
    return jsonify({
        "success": False,
        "data": None,
        "error": message
    }), status


# ---- Run ----
if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
