from flask import Flask, request, jsonify,make_response
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
import pytz
import os
from flask_cors import CORS
from bson.objectid import ObjectId
from pymongo.errors import PyMongoError
from tokenCheck import token_required

from admins import admin_bp
from auth import auth_bp
from wallet import wallet_bp
# Load environment variables
load_dotenv()

# Setup
MONGO_URI = os.getenv("MONGO_URI")
SECRET_KEY =os.getenv("SECRET_KEY")
DB_NAME = os.getenv("DB_NAME")
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
products = db["products"]
bids = db["bids"]
auctions = db["auctions"]
users=db["users"]
admins=db["admins"]
transactions=db["transactions"]


app = Flask(__name__)
app.register_blueprint(admin_bp, url_prefix='/')
app.register_blueprint(auth_bp, url_prefix='/')
app.register_blueprint(wallet_bp, url_prefix='/')

CORS(app,
     supports_credentials=True,
     origins=[
         "http://localhost:5173",
         "https://smart-auction-1213.vercel.app"
     ],
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
utc = pytz.utc





@app.route("/")
def home():
    return jsonify({"message": "Welcome to CodeClash Auction Table"}), 200


@app.route("/products", methods=["GET"])
def get_products():
    try:
        now = datetime.utcnow()
        # Auto-mark products as sold if expired and have bids
        try:
            all_products = list(products.find())
            for product in all_products:
                if product.get("status") == "unsold" and product.get("bids") and product.get("time"):
                    end_time = datetime.fromisoformat(product["time"])
                    if now >= end_time:
                        products.update_one({"id": product["id"]}, {"$set": {"status": "sold"}})
        except Exception as e:
            app.logger.error(f"Error updating product statuses: {str(e)}")

        query = {
            "status": "unsold",
            "auction_id": {"$ne": None},
            "time": {"$gt": now.isoformat()}
        }

        try:
            matching = list(products.find(query))
            result = []
            for p in matching:
                result.append({
                    "id": p.get("id"),
                    "name": p.get("name"),
                    "description": p.get("description"),
                    "auction_id": p.get("auction_id"),
                    "status": p.get("status"),
                    "time": p.get("time")
                })
            return jsonify(result), 200
        except PyMongoError as e:
            app.logger.error(f"Database error fetching products: {str(e)}")
            return jsonify({"error": "Failed to fetch products due to database error"}), 500

    except Exception as e:
        app.logger.error(f"Unexpected error in get_products: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500


@app.route("/bid", methods=["POST"])
def place_bid():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No data provided in request"}), 400

        product_key = data.get("product_name")
        bid_amount = data.get("bid_amount")
        username = data.get("user_id")  # sent explicitly
        now = datetime.utcnow()

        try:
            product_id = int(product_key)
        except ValueError:
            product_id = None

        if not product_key or bid_amount is None or not username:
            return jsonify({"success": False, "message": "Missing required fields."}), 400

        user = users.find_one({"username": username})
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404

        if user.get("wallet_balance", 0.0) < bid_amount:
            return jsonify({"success": False, "message": "Insufficient wallet balance"}), 400

        query = {
            "$or": [
                {"id": str(product_key)},
                {"id": product_id},
                {"name": product_key}
            ]
        }
        product = products.find_one(query)

        if not product:
            return jsonify({"success": False, "message": "Product not found."}), 404

        if product["status"] == "sold":
            return jsonify({"success": False, "message": "Bidding closed. Product already sold."}), 400

        try:
            end_time = datetime.fromisoformat(product["time"])
        except ValueError:
            return jsonify({"success": False, "message": "Invalid time format for product"}), 400

        if now >= end_time:
            products.update_one({"id": product["id"]}, {"$set": {"status": "sold"}})
            return jsonify({"success": False, "message": "Bidding time is over."}), 400

        # Get highest bid
        embedded_bids = product.get("bids", [])
        max_bid = max([b.get("amount", 0) for b in embedded_bids], default=0)

        if bid_amount <= max_bid:
            return jsonify({
                "success": False,
                "message": f"Bid must be higher than current max of {max_bid}."
            }), 400

        # Deduct from wallet
        users.update_one({"username": username}, {"$inc": {"wallet_balance": -bid_amount}})

        # Insert into bids collection
        bid_entry = {
            "product_id": product.get("id"),
            "product_name": product.get("name"),
            "amount": bid_amount,
            "status": "success",
            "timestamp": now,
            "user_id": username,
            "auction_id": product.get("auction_id")
        }
        bids.insert_one(bid_entry)

        # Log transaction
        transactions.insert_one({
            "username": username,
            "type": "bid",
            "amount": bid_amount,
            "timestamp": now,
            "meta": {
                "product_id": product.get("id"),
                "notes": f"Bid placed for {product['name']}"
            }
        })

        # Push to product's embedded bids
        products.update_one(
            {"_id": product["_id"]},
            {"$push": {"bids": {
                "amount": bid_amount,
                "timestamp": now,
                "user_id": username,
            }}}
        )

        return jsonify({"success": True, "message": "Bid placed successfully."}), 201

    except Exception as e:
        app.logger.error(f"Unexpected error in place_bid: {str(e)}")
        return jsonify({"success": False, "message": "An unexpected error occurred"}), 500


@app.route("/highest-bid", methods=["GET"])
def get_highest_bid():
    try:
        product_key = request.args.get("product_key")
        if not product_key:
            return jsonify({"error": "Missing product_key in query."}), 400

        try:
            product_id = int(product_key)
        except ValueError:
            product_id = None

        query = {
            "$or": [
                {"id": str(product_key)},
                {"id": product_id},
                {"name": product_key}
            ]
        }

        try:
            product = products.find_one(query)
            if not product:
                return jsonify({"error": "Product not found"}), 404

            embedded_bids = product.get("bids", [])
            max_bid = max([b.get("amount", 0) for b in embedded_bids], default=0)

            return jsonify({
                "product": product["name"],
                "highest_bid": max_bid
            }), 200
        except PyMongoError as e:
            app.logger.error(f"Database error in get_highest_bid: {str(e)}")
            return jsonify({"error": "Failed to fetch highest bid due to database error"}), 500

    except Exception as e:
        app.logger.error(f"Unexpected error in get_highest_bid: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500


@app.route("/time-left", methods=["GET"])
def get_time_left():
    try:
        product_key = request.args.get("product_key")
        if not product_key:
            return jsonify({"error": "Missing product_key in query."}), 400
        
        try:
            product_id = int(product_key)
        except ValueError:
            product_id = None

        query = {
            "$or": [
                {"id": str(product_key)},
                {"id": product_id},
                {"name": product_key}
            ]
        }

        try:
            product = products.find_one(query)
            if not product:
                return jsonify({"error": "Product not found"}), 404
            
            auction_end = product.get("time")  # Changed from auction_end_time to time
            if not auction_end:
                return jsonify({"error": "Auction end time not set"}), 400
            
            try:
                auction_end = datetime.fromisoformat(auction_end)
            except ValueError as e:
                return jsonify({"error": f"Invalid date format: {str(e)}"}), 400
            
            now = datetime.utcnow()
            time_left = (auction_end - now).total_seconds()
            time_left = max(int(time_left), 0)
            
            return jsonify({
                "product": product["name"],
                "time_remaining_seconds": time_left
            }), 200
        except PyMongoError as e:
            app.logger.error(f"Database error in get_time_left: {str(e)}")
            return jsonify({"error": "Failed to fetch time left due to database error"}), 500

    except Exception as e:
        app.logger.error(f"Unexpected error in get_time_left: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500


@app.route("/bids", methods=["GET"])
def get_all_bids():
    try:
        product_key = request.args.get("product_key")
        if not product_key:
            return jsonify({"error": "Missing product_key in query."}), 400

        try:
            product_id = int(product_key)
        except ValueError:
            product_id = None

        query = {
            "$or": [
                {"id": str(product_key)},
                {"id": product_id},
                {"name": product_key}
            ]
        }

        try:
            product = products.find_one(query)
            if not product:
                return jsonify({"error": "Product not found"}), 404

            bid_query = {
                "$or": [
                    {"product_id": product.get("id")},
                    {"product_name": product.get("name")}
                ]
            }

            try:
                bid_list = bids.find(bid_query).sort("timestamp", -1)
                result = []
                for b in bid_list:
                    result.append({
                        "amount": b.get("amount"),  # Fixed from bid_amount to amount
                        "user_id": b.get("user_id"),  # Changed from user_mobile to user_id
                        "timestamp": b.get("timestamp").isoformat() if b.get("timestamp") else None,
                        "status": b.get("status", "success")
                    })
                return jsonify(result), 200
            except PyMongoError as e:
                app.logger.error(f"Database error fetching bids: {str(e)}")
                return jsonify({"error": "Failed to fetch bids due to database error"}), 500

        except PyMongoError as e:
            app.logger.error(f"Database error finding product: {str(e)}")
            return jsonify({"error": "Failed to find product due to database error"}), 500

    except Exception as e:
        app.logger.error(f"Unexpected error in get_all_bids: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@token_required
@app.route("/user-bids", methods=["GET"])
def get_user_bids():
    try:
        user_id = request.args.get("user_id")
        if not user_id:
            return jsonify({"error": "Missing user_id in query."}), 400

        try:
            bid_query = {"user_id": user_id}
            bid_list = bids.find(bid_query).sort("timestamp", -1)

            result = []
            for b in bid_list:
                result.append({
                    "bid_id":b.get("_id"),
                    "product_id": b.get("product_id"),
                    "product_name": b.get("product_name"),
                    "amount": b.get("amount"),
                    "timestamp": b.get("timestamp").isoformat() if b.get("timestamp") else None,
                    "status": b.get("status", "success")
                })

            return jsonify(result), 200

        except Exception as e:
            app.logger.error(f"Database error fetching user bids: {str(e)}")
            return jsonify({"error": "Failed to fetch user bids due to database error"}), 500

    except Exception as e:
        app.logger.error(f"Unexpected error in get_user_bids: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500


if __name__ == "__main__":
    app.run(debug=True)
