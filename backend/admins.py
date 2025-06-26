from flask import Blueprint, request, jsonify,current_app as app
from pymongo import MongoClient
from datetime import datetime
from pymongo.errors import PyMongoError
from tokenCheck import token_required
from db import DB_NAME,MONGO_URI

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
admin_bp = Blueprint('admin', __name__)
products = db["products"]
bids = db["bids"]
auctions = db["auctions"]
users=db["users"]
admins=db["admins"]
transactions=db["transactions"]

# Admin routes

@admin_bp.route("/admin/auction", methods=["POST"])
@token_required
def create_auction(decoded_token):
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


@admin_bp.route("/admin/auction/<auction_id>", methods=["DELETE"])
@token_required
def delete_auction(decoded_token,auction_id):
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


@admin_bp.route("/admin/product/<product_id>", methods=["DELETE"])
@token_required
def delete_product(decoded_token,product_id):
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


@admin_bp.route("/admin/product", methods=["POST"])
@token_required
def add_product(decoded_token):
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


@admin_bp.route("/admin/product/<product_id>", methods=["PUT"])
@token_required
def update_product(decoded_token,product_id):
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


@admin_bp.route("/admin/auction/<auction_id>", methods=["PUT"])
@token_required
def update_auction(decoded_token,auction_id):
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


@admin_bp.route("/admin/all_auctions", methods=["GET"])
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


@admin_bp.route("/admin/auction_products/<auction_id>", methods=["GET"])
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


@admin_bp.route("/admin/products", methods=["GET"])
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


@admin_bp.route("/admin/all_products", methods=["GET"])
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
