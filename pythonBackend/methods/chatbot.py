import json
import random
import pickle
import tensorflow as tf
import numpy as np
import pandas as pd
import nltk
from nltk.tokenize import word_tokenize
from nltk.tag import pos_tag
import string
import regex as re
from collections import defaultdict
import datetime

from db import cartsModel, ordersModel, productsModel

lemmatizer = nltk.stem.WordNetLemmatizer()


def fuzzy_search(query, dataframe, threshold=0.6):
    best_score = 0
    index = -1

    # Pre-process query string for efficient matching
    query = query.lower()
    query_words = re.findall(r'\w+', query)

    # Loop through each item and calculate score
    items = dataframe['title']
    for i, item in enumerate(items):
        item = item.lower()
        score = 0
        matched_words = set()

        # Calculate score based on number of matching words and their position
        for word in query_words:
            match = re.search(fr'\b{word}\b', item)
            if match:
                score += 1 / len(query_words)
                matched_words.add(word)
                if match.start() == 0:
                    score += 0.1
                if match.end() == len(item):
                    score += 0.1

        # Calculate score based on number of matching characters
        for word in matched_words:
            for j in range(len(word), len(query) + 1):
                sub_query = query[:j]
                sub_score = item.count(sub_query) / len(item)
                score += sub_score * (len(sub_query) / len(query))

        # Update best match if score is above threshold
        if score > threshold and score > best_score:
            best_match = item
            best_score = score
            index = i

    if index == -1:
        return None
    return dataframe.loc[index, "_id"]


def extract_items_and_quantity(sentence):
    productsDF = pd.read_csv('dataset/cleanedMetaData.csv')
    tokens = word_tokenize(sentence)
    tags = pos_tag(tokens)

    items = defaultdict(int)
    last_item = None
    for i, (word, tag) in enumerate(tags):
        if tag == 'NN' or tag == 'NNS':
            if i > 0 and tags[i-1][1] in ['NN', 'NNS']:
                last_item = items.popitem()[0] + ' ' + word if items else word
            elif word.lower() != 'order' and word.lower() != 'i':
                items[word] = 1
    if last_item is not None:
        items[last_item] = 1

    words_split = sentence.translate(
        str.maketrans('', '', string.punctuation)).split()
    for i in range(0, len(words_split)):
        if words_split[i].isdigit():
            if (words_split[i+1] in items):
                items[words_split[i+1]] = words_split[i]
            elif (words_split[i+1]+' '+words_split[i+2] in items):
                items[words_split[i+1]+' '+words_split[i+2]] = words_split[i]
    items2 = defaultdict(int)
    for old_key in items.keys():
        # Replace the old key with the new key
        productId = fuzzy_search(old_key, productsDF)
        if productId:
            items2[productId] = items[old_key]
    return items2


def handleCartIntent(sentence):
    # Get the user's order
    if ("order" in sentence):
        order_index = sentence.index("order") + len("order")
    elif ("want" in sentence):
        order_index = sentence.index("want") + len("want")
    elif ("get" in sentence):
        order_index = sentence.index("get") + len("get")
    elif ("add" in sentence):
        order_index = sentence.index("add") + len("add")
    sentence = sentence[order_index:].strip()

    shopping_cart.update(extract_items_and_quantity(sentence))
    # Confirm the order and show the shopping cart

    if len(shopping_cart) == 0:
        return f"Sorry no products found for {sentence}. Please try with some other products.<br /><br /> Thank you"
    response = """<div style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <p>Sure, The following items will be added to cart:</p>
                        <div style="display: flex; flex-direction: column; gap: .8rem;">
                """
    for productId, count in shopping_cart.items():
        productData = productsModel.find_one(
            {"_id": productId}, {"imageURLHighRes": 1, "title": 1, "price": 1})
        imageUrl = productData['imageURLHighRes'][0]
        title = productData['title'][:40]
        price = productData['price']
        response += f"""
        <div style="display: flex; flex-direction: row; gap: 0.5rem; align-items: center">
            <div style="height: 60px; width: 90px;">
                <img src={imageUrl} style="height: 100%; width: 100%; object-fit: contain;" alt="" />
            </div>
            <div style="display: flex; flex-direction: column;">
                <span style="font-size: 12px;">{title}...</span>
                <div style="display: flex; flex-direction: row; justify-content: space-between;">
                    <span style="font-size: 10px;">₹ {round(price,2)}</span>
                    <span style="font-size: 10px;">Qty: {count}</span>
                </div>
            </div>
        </div>
        """
    response += f"</div><p>Please confirm if you want to add above items else cancel.</p></div>"

    return response


def cleanSentence(sentence):
    # tokenize the pattern - split words into array
    sentence_words = nltk.word_tokenize(sentence)
    # stem each word - create short form for word
    sentence_words = [lemmatizer.lemmatize(
        word.lower()) for word in sentence_words]
    return sentence_words


def bow(sentence, words):
    # tokenize the pattern
    sentence_words = cleanSentence(sentence)
    # bag of words - matrix of N words, vocabulary matrix
    bag = [0]*len(words)
    for s in sentence_words:
        for i, w in enumerate(words):
            if w == s:
                # assign 1 if current word is in the vocabulary position
                bag[i] = 1
    return (np.array(bag))


def predictClass(sentence, model, chatWords, chatClasses):
    # filter out predictions below a threshold
    p = bow(sentence, chatWords)
    res = model.predict(np.array([p]))[0]
    ERROR_THRESHOLD = 0.95
    results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]
    # sort by strength of probability
    results.sort(key=lambda x: x[1], reverse=True)
    return_list = []
    for r in results:
        return_list.append(
            {"intent": chatClasses[r[0]], "probability": str(r[1])})
    return return_list


def handleAddCart(userId):
    if len(shopping_cart) == 0:
        return "Please first ask me to order some items and confirm the order."
    newProducts = []
    for productId, count in shopping_cart.items():
        newProducts.append({"id": productId, "quantity": int(count)})
    oldCart = cartsModel.find_one({"userId": userId})
    if oldCart:
        oldProducts = list(oldCart['products'])
        for oldItem in oldProducts:
            newProducts = list(
                filter(lambda x: x['id'] != oldItem['id'], newProducts))
        cartsModel.update_one({"userId": userId}, {
                              "$push": {"products": {"$each": newProducts}}})
    else:
        cartsModel.insert_one({"userId": userId, "products": newProducts})
    shopping_cart.clear()
    return "The items are successfully added to cart"


def handleCancelCart():
    if len(shopping_cart) == 0:
        return "Please first ask me to order some items and cancel the order."
    shopping_cart.clear()
    return "The items has not been added to your cart. Thank you"


def handlePlaceOrder():
    return """
                <div 
                style="
                    display: flex; 
                    flex-direction: column; 
                    gap: 4px;
                ">
                    <p>
                        Sure, you can proceed to checkout your cart by clicking on the button below.
                    </p>
                    <a href="/checkout" 
                    style="
                        background: #fff; 
                        color: #3BB77E; 
                        border: 1px solid #3BB77E;
                        border-radius: 4px; 
                        padding: 8px 32px; 
                        align-self: center; 
                        margin: 8px 0;
                    ">
                        Checkout
                    </a>
                </div>
            """


def handleViewCart(userId):
    cartDataAll = cartsModel.aggregate([
        {
            "$match": {
                "userId": userId
            }
        },
        {
            "$unwind": "$products",
        },
        {
            "$lookup": {
                "from": "products",
                "localField": "products.id",
                "foreignField": "_id",
                "as": "productDetails",
            },
        },
        {
            "$unwind": "$productDetails",
        },
        {
            "$addFields": {
                "imageUrl": {
                    "$first": "$productDetails.imageURLHighRes",
                },
            },
        },
        {
            "$project": {
                "_id": "$productDetails._id",
                "imageUrl": 1,
                "quantity": "$products.quantity",
                "title": "$productDetails.title",
                "price": "$productDetails.price",
            },
        },
    ])
    cartData = list(cartDataAll)
    if not cartData:
        return "Your cart seems empty. Please add some items to cart. <br /><br /> You can also ask me to add items to your cart"

    response = """<div style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <p>Here is the list of items currently available in your cart</p>
                        <div style="display: flex; flex-direction: column; gap: .8rem;">
                """
    total = 0
    for data in cartData:
        title = data['title'][:40]
        imageUrl = data['imageUrl']
        quantity = int(data['quantity'])
        price = float(data['price'])
        total += quantity * price
        response += f"""
        <div style="display: flex; flex-direction: row; gap: 0.5rem; align-items: center">
            <div style="height: 60px; width: 90px;">
                <img src={imageUrl} style="height: 100%; width: 100%; object-fit: contain;" alt="" />
            </div>
            <div style="display: flex; flex-direction: column;">
                <span style="font-size: 12px;">{title}...</span>
                <div style="display: flex; flex-direction: row; justify-content: space-between;">
                    <span style="font-size: 10px;">₹ {round(price,2)}</span>
                    <span style="font-size: 10px;">Qty: {quantity}</span>
                </div>
            </div>
        </div>
        """
    response += f"</div><p>Total: ₹ {round(total,2)}</div>"
    return response


def handleClearCart(userId):
    cartsModel.delete_one({"userId": userId})
    return "Sure, <br /> Your cart has been cleared."


def handleGetOrders(userId):
    orderDetails = ordersModel.aggregate([
        {
            "$match": {
                "userId": userId,
            }
        },
        {
            "$sort": {
                "orderDate": -1
            }
        },
        {
            "$limit": 3
        },
        {
            "$project": {
                "orderId": 1,
                "status": 1,
                "totalAmount": 1,
                "orderDate": 1,
            }
        }
    ])
    orderData = list(orderDetails)

    if not orderData:
        return "You do not have any past orders. Please order some products."
    response = """<div style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <p>Here is the status of your past three orders</p>
                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                """
    for data in orderData:
        orderId = data['orderId']
        status = data['status']
        totalAmount = data['totalAmount']
        orderDate = datetime.datetime.fromisoformat(str(data['orderDate']))
        response += f"""
        <div>
            <p>Order ID: {orderId}</p>
            <p>OrderDate: {orderDate.strftime("%a %d %b, %Y")}</p>
            <p>Status: {status}</p>
            <p>Total: ₹ {round(totalAmount,2)}</p>
        </div>
        """
    response += f"</div></div>"
    return response


def getResponse(ints, intents_json, query, userId=None):
    if (len(ints) == 0):
        return "Sorry. I did not understand"

    tag = ints[0]['intent']
    list_of_intents = intents_json['intents']
    for i in list_of_intents:
        if (i['tag'] == tag):
            if tag == "order":
                if userId:
                    return handleCartIntent(query)
                    # return handleCartIntent()
                return "Please login to add items to cart."
            elif tag == "add_cart":
                if userId:
                    return handleAddCart(userId)
                return "Please login to manage cart."
            elif tag == "cancel_cart":
                if userId:
                    return handleCancelCart()
                return "Please login to manage cart."
            elif tag == "place_order":
                if userId:
                    return handlePlaceOrder()
                return "Please login to place order."
            elif tag == "view_cart":
                if userId:
                    return handleViewCart(userId)
                return "Please login to view cart."
            elif tag == "clear_cart":
                if userId:
                    # shopping_cart.clear()
                    return handleClearCart(userId)
                return "Please login to manage your cart."
            elif tag == "get_orders":
                if userId:
                    return handleGetOrders(userId)
                return "Please login to get your orders."
            else:
                return random.choice(i['responses'])
    return "Sorry. I did not understand."


def chatbotResponse(text, userId, localCart):
    global shopping_cart

    with open('dataset/chatbot/chatWords.pkl', 'rb') as f:
        chatWords = pickle.load(f)

    with open('dataset/chatbot/chatClasses.pkl', 'rb') as f:
        chatClasses = pickle.load(f)

    chatIntents = json.loads(open('dataset/chatbot/intents.json').read())

    chatbotModel = tf.keras.models.load_model(
        'trainedModels/chatbotModel.h5')
    shopping_cart = localCart
    ints = predictClass(text, chatbotModel, chatWords, chatClasses)
    res = getResponse(ints, chatIntents, text, userId)
    return res, shopping_cart
