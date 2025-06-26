
import os
import bcrypt
import jwt
from dotenv import load_dotenv
from functools import wraps
from flask import Flask, request, jsonify
load_dotenv()

SECRET_KEY =os.getenv("SECRET_KEY")
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # 1. Try getting token from Authorization header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        else:
            # 2. Fallback: Try getting token from cookie
            token = request.cookies.get("token")  # instead of "tokenId"

        if not token:
            return jsonify({"error": "Token is missing!"}), 401

        try:
            decoded_data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            return f(decoded_data, *args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired!"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token!"}), 401

    return decorated