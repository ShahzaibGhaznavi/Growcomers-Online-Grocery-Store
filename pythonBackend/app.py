from dotenv import load_dotenv, find_dotenv
from db import productsModel

from methods.smartSearch import loadSmartSearchProducts
from methods.recommender import loadPopularProducts, loadRelatedProducts, loadRecommendations
from methods.chatbot import chatbotResponse
from methods.trainModel import trainCFModel

from flask import Flask, jsonify, request, session
from flask_cors import CORS
import jwt
import os
import time
from collections import defaultdict
import warnings

warnings.filterwarnings('ignore')
load_dotenv(find_dotenv())
JWTkey = os.environ.get("JWT_SECRET_KEY")

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY")

if not JWTkey:
    raise RuntimeError("JWT_SECRET_KEY environment variable is required")

if not app.secret_key:
    raise RuntimeError("FLASK_SECRET_KEY environment variable is required")
app.config['SESSION_COOKIE_HTTPONLY'] = True
CORS(app, supports_credentials=True)


@app.route('/')
def rootRoute():
    return 'Welcome to GrowComers backend'


@app.route('/product/popular', methods=['GET'])
def getPopularProducts():
    try:
        products = loadPopularProducts()

        return jsonify(data=products), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


@app.route('/product/related', methods=['GET'])
def getRelatedProducts():
    try:
        productId = request.args.get('id')

        if not productId or productId == "undefined":
            return jsonify({"message": "Product Id is required"}), 400

        productData = productsModel.find_one(
            {"_id": productId}, {'title': 1, 'description': 1})

        if not productData or productData == "undefined":
            return jsonify({"message": "No product found"}), 400

        productText = productData['title'] + ' ' + productData['description']

        products = loadRelatedProducts(productId, productText)

        return jsonify(data=products), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


# COLLABORATIVE FILTERING ENDPOINT
@app.route('/user/recommend', methods=['GET'])
def getRecommendedProducts():
    try:
        userId = request.args.get('id')

        if not userId or userId == "undefined":
            return jsonify({"message": "User ID is required"}), 400

        products = loadRecommendations(userId)

        return jsonify(data=products), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


@app.route('/product/search', methods=['GET'])
def getSearchedProducts():
    try:
        query = request.args.get('query')

        products = loadSmartSearchProducts(query)

        return jsonify(data=products), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


@app.route('/chat', methods=['GET'])
def getChatbotReply():
    try:
        authorization = request.headers.get("Authorization")
        userId = None
        localCart = session.get('localCart', defaultdict(int))
        if authorization:
            token = authorization.split()[1]
            userData = jwt.decode(
                token, JWTkey, algorithms='HS256')
            userId = userData['userId']
        query = request.args.get('query')
        res, updatedCart = chatbotResponse(query, userId, localCart)
        session['localCart'] = updatedCart
        return jsonify(data=res), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


@app.route('/train', methods=['GET', 'POST'])
def trainModel():
    try:
        authorization = request.headers.get("Authorization")
        if not authorization:
            return jsonify({"message": "No token"}), 401

        token = authorization.split()[1]
        userData = jwt.decode(
            token, JWTkey, algorithms='HS256')
        role = userData['role']

        if role != "ADMIN":
            return jsonify({"message": "Not authorized"}), 403

        if request.method == 'GET':
            modifiedDate = os.path.getmtime("trainedModels/neuralNetwork.h5")
            return jsonify(data=modifiedDate), 200
        else:
            epoch = request.json.get('epoch')
            print(epoch)
            RMSE, MSE, MAE, accuracy = trainCFModel(epoch)
            return_data = {
                "RMSE": RMSE,
                "MSE": MSE,
                "MAE": MAE,
                "accuracy": accuracy
            }
            return jsonify(data=return_data), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


if __name__ == "__main__":
    app.run()
