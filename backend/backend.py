from flask import Flask, request, jsonify
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
import pytz
import os
from flask_cors import CORS
from bson.objectid import ObjectId
from pymongo.errors import PyMongoError

# Load environment variables
load_dotenv()

# Setup
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
products = db["products"]
bids = db["bids"]
auctions = db["auctions"]

app = Flask(__name__)
CORS(app)
utc = pytz.utc


@app.route("/")
def home():
    return jsonify({"message": "Welcome to CodeClash Auction Table"}), 200

@app.route("/admin/all_auctions", methods=["GET"])
def get_all_auctions():
    try:
        auction_list = list(auctions.find({}))
        result = []
        for a in auction_list:
            result.append({
                "id": a.get("id"),
                "name": a.get("name"),
                "valid_until": a.get("valid_until"),
                "product_ids": a.get("product_ids", [])
            })
        return jsonify({
            "total_auctions": len(result),
            "auctions": result
        }), 200

    except Exception as e:
        app.logger.error(f"Error fetching auctions: {str(e)}")
        return jsonify({"error": "Failed to fetch auctions"}), 500
@app.route("/admin/auction_products/<auction_id>", methods=["GET"])
def get_products_by_auction(auction_id):
    try:
        matching_products = list(products.find({"auction_id": auction_id}))
        result = []
        for p in matching_products:
            result.append({
                "id": p.get("id"),
                "name": p.get("name"),
                "description": p.get("description"),
                "status": p.get("status"),
                "time": p.get("time")
            })
        return jsonify({
            "auction_id": auction_id,
            "total_products": len(result),
            "products": result
        }), 200

    except Exception as e:
        app.logger.error(f"Error fetching products for auction {auction_id}: {str(e)}")
        return jsonify({"error": "Failed to fetch products for the given auction"}), 500


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


@app.route("/admin/products", methods=["GET"])
def get_products2():
    try:
        now = datetime.utcnow()
        # Auto-mark products as sold if expired and have bids
        query = {
            "status": "unsold",
            "auction_id": None,
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


@app.route("/admin/all_products", methods=["GET"])
def get_productsAll():
    try:
        now = datetime.utcnow()
        query = {}

        try:
            matching = list(products.find(query))
            total_products = len(matching)
            total_auctions = auctions.count_documents({})
            total_bids = bids.count_documents({})

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

            return jsonify({
                "total_products": total_products,
                "total_auctions": total_auctions,
                "total_bids": total_bids,
                "products": result
            }), 200

        except PyMongoError as e:
            app.logger.error(f"Database error fetching products: {str(e)}")
            return jsonify({"error": "Failed to fetch products due to database error"}), 500

    except Exception as e:
        app.logger.error(f"Unexpected error in get_productsAll: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500



@app.route("/bid", methods=["POST"])
def place_bid():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No data provided in request"}), 400

        product_key = data.get("product_name")
        bid_amount = data.get("bid_amount")
        user_id = data.get("user_id")
        now = datetime.utcnow()

        try:
            product_id = int(product_key)
        except ValueError:
            product_id = None

        if not product_key or bid_amount is None or not user_id:
            return jsonify({"success": False, "message": "Missing required fields."}), 400

        try:
            # Search by id or name
            query = {
                "$or": [
                    {"id": str(product_key)},    # for string ID
                    {"id": product_id},          # for numeric ID
                    {"name": product_key}        # match by name
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
                try:
                    products.update_one({"id": product["id"]}, {"$set": {"status": "sold"}})
                except PyMongoError:
                    app.logger.error("Failed to update product status")
                return jsonify({"success": False, "message": "Bidding time is over."}), 400

            # Find max bid from product's embedded bids
            embedded_bids = product.get("bids", [])
            max_bid = max([b.get("amount", 0) for b in embedded_bids], default=0)

            if bid_amount <= max_bid:
                return jsonify({
                    "success": False,
                    "message": f"Bid must be higher than current max of {max_bid}."
                }), 400

            # Insert into bids collection
            bid_entry = {
                "product_id": product.get("id"),
                "product_name": product.get("name"),
                "amount": bid_amount,
                "status": "success",
                "timestamp": now,
                "user_id": user_id,
                "auction_id": product.get("auction_id")
            }
            
            try:
                bids.insert_one(bid_entry)
            except PyMongoError as e:
                app.logger.error(f"Failed to insert bid: {str(e)}")
                return jsonify({"success": False, "message": "Failed to record bid"}), 500

            # Update product's embedded bid array
            try:
                products.update_one(
                    {"_id": product["_id"]},
                    {"$push": {"bids": {
                        "amount": bid_amount,
                        "timestamp": now,
                        "user_id": user_id,
                    }}}
                )
            except PyMongoError as e:
                app.logger.error(f"Failed to update product bids: {str(e)}")
                # Attempt to clean up the bid we just inserted
                bids.delete_one({"_id": bid_entry.get("_id")})
                return jsonify({"success": False, "message": "Failed to update product with bid"}), 500

            return jsonify({"success": True, "message": "Bid placed successfully."}), 201

        except PyMongoError as e:
            app.logger.error(f"Database error in place_bid: {str(e)}")
            return jsonify({"success": False, "message": "Database error occurred"}), 500

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


# Admin routes
@app.route("/admin/auction", methods=["POST"])
def create_auction():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400

        required_fields = ["id", "name", "product_ids", "valid_until"]
        if not all(field in data for field in required_fields):
            return jsonify({"success": False, "message": "Missing required fields"}), 400

        auction = {
            "id": data["id"],
            "name": data["name"],
            "product_ids": data["product_ids"],
            "valid_until": data["valid_until"]
        }

        try:
            auctions.insert_one(auction)
        except PyMongoError as e:
            app.logger.error(f"Failed to create auction: {str(e)}")
            return jsonify({"success": False, "message": "Failed to create auction"}), 500

        # Assign auction_id to listed products
        try:
            result = products.update_many(
                {"id": {"$in": auction["product_ids"]}},
                {"$set": {"auction_id": auction["id"]}}
            )
            if result.matched_count != len(auction["product_ids"]):
                app.logger.warning(f"Only matched {result.matched_count} products out of {len(auction['product_ids'])}")
        except PyMongoError as e:
            app.logger.error(f"Failed to update products with auction ID: {str(e)}")
            # Attempt to clean up the auction we just created
            auctions.delete_one({"id": auction["id"]})
            return jsonify({"success": False, "message": "Failed to link products to auction"}), 500

        return jsonify({"success": True, "message": "Auction created and linked to products."}), 201

    except Exception as e:
        app.logger.error(f"Unexpected error in create_auction: {str(e)}")
        return jsonify({"success": False, "message": "An unexpected error occurred"}), 500


@app.route("/admin/auction/<auction_id>", methods=["DELETE"])
def delete_auction(auction_id):
    try:
        if not auction_id:
            return jsonify({"success": False, "message": "Missing auction_id"}), 400

        try:
            # First check if auction exists
            auction = auctions.find_one({"id": auction_id})
            if not auction:
                return jsonify({"success": False, "message": "Auction not found"}), 404

            # Remove auction_id from all linked products
            try:
                products.update_many({"auction_id": auction_id}, {"$set": {"auction_id": None}})
            except PyMongoError as e:
                app.logger.error(f"Failed to unlink products from auction: {str(e)}")
                return jsonify({"success": False, "message": "Failed to unlink products"}), 500

            # Delete the auction
            try:
                auctions.delete_one({"id": auction_id})
            except PyMongoError as e:
                app.logger.error(f"Failed to delete auction: {str(e)}")
                return jsonify({"success": False, "message": "Failed to delete auction"}), 500

            # Optionally delete related bids
            try:
                bids.delete_many({"auction_id": auction_id})
            except PyMongoError as e:
                app.logger.error(f"Failed to delete related bids: {str(e)}")
                # We'll still return success since the main operation completed

            return jsonify({"success": True, "message": "Auction deleted and products unlinked."}), 200

        except PyMongoError as e:
            app.logger.error(f"Database error in delete_auction: {str(e)}")
            return jsonify({"success": False, "message": "Database error occurred"}), 500

    except Exception as e:
        app.logger.error(f"Unexpected error in delete_auction: {str(e)}")
        return jsonify({"success": False, "message": "An unexpected error occurred"}), 500


@app.route("/admin/product/<product_id>", methods=["DELETE"])
def delete_product(product_id):
    try:
        if not product_id:
            return jsonify({"success": False, "message": "Missing product_id"}), 400

        try:
            # First check if product exists
            product = products.find_one({"id": product_id})
            if not product:
                return jsonify({"success": False, "message": "Product not found"}), 404

            # Delete the product
            try:
                products.delete_one({"id": product_id})
            except PyMongoError as e:
                app.logger.error(f"Failed to delete product: {str(e)}")
                return jsonify({"success": False, "message": "Failed to delete product"}), 500

            # Remove from any auctions' product_ids list
            try:
                auctions.update_many({}, {"$pull": {"product_ids": product_id}})
            except PyMongoError as e:
                app.logger.error(f"Failed to remove product from auctions: {str(e)}")
                # We'll still return success since the main operation completed

            # Optionally delete related bids
            try:
                bids.delete_many({"product_id": product_id})
            except PyMongoError as e:
                app.logger.error(f"Failed to delete related bids: {str(e)}")

            return jsonify({"success": True, "message": "Product deleted and removed from auctions."}), 200

        except PyMongoError as e:
            app.logger.error(f"Database error in delete_product: {str(e)}")
            return jsonify({"success": False, "message": "Database error occurred"}), 500

    except Exception as e:
        app.logger.error(f"Unexpected error in delete_product: {str(e)}")
        return jsonify({"success": False, "message": "An unexpected error occurred"}), 500


@app.route("/admin/product", methods=["POST"])
def add_product():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400

        required_fields = ["id", "name", "description", "time"]
        if not all(field in data for field in required_fields):
            return jsonify({"success": False, "message": "Missing required fields"}), 400

        product = {
            "id": data["id"],
            "name": data["name"],
            "description": data["description"],
            "auction_id": None,
            "time": data["time"],
            "status": "unsold",
            "bids": []
        }

        try:
            products.insert_one(product)
            return jsonify({"success": True, "message": "Product added."}), 201
        except PyMongoError as e:
            app.logger.error(f"Failed to add product: {str(e)}")
            return jsonify({"success": False, "message": "Failed to add product"}), 500

    except Exception as e:
        app.logger.error(f"Unexpected error in add_product: {str(e)}")
        return jsonify({"success": False, "message": "An unexpected error occurred"}), 500


@app.route("/admin/product/<product_id>", methods=["PUT"])
def update_product(product_id):
    try:
        if not product_id:
            return jsonify({"success": False, "message": "Missing product_id"}), 400

        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400

        allowed_fields = ["name", "description", "auction_id", "time"]
        update_fields = {k: v for k, v in data.items() if k in allowed_fields}
        
        if not update_fields:
            return jsonify({"success": False, "message": "No valid fields to update"}), 400

        try:
            # Check if product exists first
            product = products.find_one({"id": product_id})
            if not product:
                return jsonify({"success": False, "message": "Product not found"}), 404

            # Perform the update
            result = products.update_one({"id": product_id}, {"$set": update_fields})
            if result.modified_count == 0:
                return jsonify({"success": False, "message": "No changes made to product"}), 200

            return jsonify({"success": True, "message": "Product updated."}), 200
        except PyMongoError as e:
            app.logger.error(f"Database error in update_product: {str(e)}")
            return jsonify({"success": False, "message": "Failed to update product"}), 500

    except Exception as e:
        app.logger.error(f"Unexpected error in update_product: {str(e)}")
        return jsonify({"success": False, "message": "An unexpected error occurred"}), 500


@app.route("/admin/auction/<auction_id>", methods=["PUT"])
def update_auction(auction_id):
    try:
        if not auction_id:
            return jsonify({"success": False, "message": "Missing auction_id"}), 400

        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400

        allowed_fields = ["name", "product_ids", "valid_until"]
        update_fields = {k: v for k, v in data.items() if k in allowed_fields}
        
        if not update_fields:
            return jsonify({"success": False, "message": "No valid fields to update"}), 400

        try:
            # Check if auction exists first
            auction = auctions.find_one({"id": auction_id})
            if not auction:
                return jsonify({"success": False, "message": "Auction not found"}), 404

            # Perform the update
            result = auctions.update_one({"id": auction_id}, {"$set": update_fields})
            if result.modified_count == 0:
                return jsonify({"success": False, "message": "No changes made to auction"}), 200

            if "product_ids" in update_fields:
                try:
                    # Reset auction_id for all products previously linked to this auction
                    products.update_many({"auction_id": auction_id}, {"$set": {"auction_id": None}})
                    
                    # Set auction_id for new product_ids
                    products.update_many(
                        {"id": {"$in": update_fields["product_ids"]}},
                        {"$set": {"auction_id": auction_id}}
                    )
                except PyMongoError as e:
                    app.logger.error(f"Failed to update product links: {str(e)}")
                    # Revert the auction update
                    auctions.update_one({"id": auction_id}, {"$set": auction})
                    return jsonify({"success": False, "message": "Failed to update product links"}), 500

            return jsonify({"success": True, "message": "Auction updated."}), 200
        except PyMongoError as e:
            app.logger.error(f"Database error in update_auction: {str(e)}")
            return jsonify({"success": False, "message": "Failed to update auction"}), 500

    except Exception as e:
        app.logger.error(f"Unexpected error in update_auction: {str(e)}")
        return jsonify({"success": False, "message": "An unexpected error occurred"}), 500


if __name__ == "__main__":
    app.run(debug=True)