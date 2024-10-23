from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import csv
import os

app = Flask(__name__)
CORS(app)

# store lastGeneratedRecipes
last_generated_recipes = []

@app.route('/save-recipes', methods=['POST'])
def save_recipes():
    global last_generated_recipes
    last_generated_recipes = request.json  # get JSON data
    print("Received data:", last_generated_recipes)
    # print(f"current is:{index + 0}")
    save_to_csv(last_generated_recipes)
    return jsonify(success=True, data=last_generated_recipes)


def save_to_csv(data):
    path = os.path.dirname(os.path.abspath(__file__))
    data = pd.DataFrame(data=last_generated_recipes, index=None)
    recipes = data['recipes']
    name_list = []
    for recipe in recipes:
        name_list.append(recipe['name'])
    df = pd.DataFrame(name_list, columns=['name'])
    df.to_csv(path + r'\recipes1.csv',index=False,encoding='utf-8')


if __name__ == '__main__':
    app.run(port=5000)
