from flask import Blueprint, request, jsonify
from extensions import db
from models.user import User

# Create Blueprint
auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# =========================
# USER REGISTRATION API
# =========================
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json

    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "USER")  # default USER

    if not username or not password:
        return jsonify({"message": "Username and password required"}), 400

    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"message": "Username already exists"}), 409

    user = User(username=username, role=role)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully",
        "role": role
    }), 201


# =========================
# LOGIN API
# =========================
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "Username and password required"}), 400

    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid credentials"}), 401

    return jsonify({
        "message": "Login successful",
        "user_id": user.id,
        "role": user.role
    }), 200



@auth_bp.route("/officer-login", methods=["POST"])
def officer_login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    # 🔐 HARDCODED OFFICER
    OFFICER_USERNAME = "sameer syed"
    OFFICER_PASSWORD = "sameersyed"

    if username == OFFICER_USERNAME and password == OFFICER_PASSWORD:
        return jsonify({
            "message": "Officer login successful",
            "officer": True
        }), 200

    return jsonify({
        "message": "You are not an officer"
    }), 403
