from flask import Blueprint, request, jsonify,make_response,current_app as app
from pymongo import MongoClient
from datetime import datetime, timedelta
import bcrypt
import jwt
from tokenCheck import token_required
from db import DB_NAME,MONGO_URI,SECRET_KEY

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

products = db["products"]
bids = db["bids"]
auctions = db["auctions"]
users=db["users"]
admins=db["admins"]
transactions=db["transactions"]

auth_bp = Blueprint('auth', __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    name = data.get("name")
    username = data.get("username")
    password = data.get("password")
    mobile = data.get("mobile_number")

    if not all([name, username, password, mobile]):
        return jsonify({"error": "All fields are required"}), 400

    existing_user = users.find_one({"username": username})
    if existing_user:
        return jsonify({"error": "Username already exists"}), 400

    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    users.insert_one({
        "name": name,
        "username": username,
        "password": hashed_pw.decode('utf-8'),
        "mobile_number": mobile,
        "wallet_balance":500.0
    })

    return jsonify({"message": "User registered successfully"}), 200


# ---------------- LOGIN ------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    user = users.find_one({"username": username})
    if not user:
        return jsonify({"error": "User not found"}), 404

    if bcrypt.checkpw(password.encode('utf-8'), user["password"].encode('utf-8')):
        payload = {
            "user_id": str(user["_id"]),
            "username": user["username"],
            "exp": datetime.utcnow() + timedelta(hours=10)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

        # Remove password before sending user details
        user_details = {
            "id": str(user["_id"]),
            "name": user.get("name"),
            "username": user.get("username"),
            "mobile_number": user.get("mobile_number"),
        }

        response = make_response(jsonify({
            "message": "Login successful",
            "user": user_details
        }), 200)

        # Set secure cookie with the token
        response.set_cookie(
            key="token",
            value=token,
            httponly=True,
            secure=True,         # must be True for samesite=None to work
            samesite='None',     # REQUIRED for cross-origin requests with credentials
            max_age=10 * 60 * 60
        )

        return response
    else:
        return jsonify({"error": "Invalid password"}), 401

# --------------- CHANGE PASSWORD ------------------

@auth_bp.route("/change-password", methods=["POST"])
@token_required
def change_password(decoded_token):
    data = request.json
    username = data.get("username")
    old_password = data.get("password")
    new_password = data.get("new_password")

    if not all([username, old_password, new_password]):
        return jsonify({"error": "All fields are required"}), 400

    user = users.find_one({"username": username})
    if not user:
        return jsonify({"error": "User not found"}), 404

    if not bcrypt.checkpw(old_password.encode('utf-8'), user["password"].encode('utf-8')):
        return jsonify({"error": "Incorrect current password"}), 401

    hashed_new_pw = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
    users.update_one(
        {"_id": user["_id"]},
        {"$set": {"password": hashed_new_pw.decode('utf-8')}}
    )

    return jsonify({"message": "Password updated successfully"}), 200


@auth_bp.route("/admin/login", methods=["POST"])
def admin_login():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    role = data.get("role")

    if not all([username, password, role]) or role.lower() != "admin":
        return jsonify({"error": "Username, password and role=admin are required"}), 400

    admin = admins.find_one({"username": username, "role": "admin"})
    if not admin:
        return jsonify({"error": "Admin not found"}), 404

    if bcrypt.checkpw(password.encode('utf-8'), admin["password"].encode('utf-8')):
        payload = {
            "admin_id": str(admin["_id"]),
            "username": admin["username"],
            "role": admin["role"],
            "exp": datetime.utcnow() + timedelta(hours=2)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

        admin_details = {
            "id": str(admin["_id"]),
            "name": admin.get("name"),
            "username": admin.get("username"),
            "mobile_number": admin.get("mobile_number"),
            "role": admin.get("role")
        }

        response = make_response(jsonify({
            "message": "Admin login successful",
            "token": token,
            "admin": admin_details
        }), 200)

        response.set_cookie(
            key="admin_token",
            value=token,
            httponly=True,
            secure=True,
            samesite='Lax',
            max_age=2 * 60 * 60
        )

        return response
    else:
        return jsonify({"error": "Incorrect password"}), 401


@auth_bp.route("/admin/change-password", methods=["POST"])
@token_required
def admin_change_password(decoded_token):
    data = request.json
    username = data.get("username")
    old_password = data.get("password")
    new_password = data.get("new_password")
    role = data.get("role")

    if not all([username, old_password, new_password, role]) or role.lower() != "admin":
        return jsonify({"error": "All fields (with role=admin) are required"}), 400

    admin = admins.find_one({"username": username, "role": "admin"})
    if not admin:
        return jsonify({"error": "Admin not found"}), 404

    if not bcrypt.checkpw(old_password.encode('utf-8'), admin["password"].encode('utf-8')):
        return jsonify({"error": "Incorrect current password"}), 401

    hashed_pw = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
    admins.update_one(
        {"_id": admin["_id"]},
        {"$set": {"password": hashed_pw.decode('utf-8')}}
    )

    return jsonify({"message": "Password updated successfully"}), 200
