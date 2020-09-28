# -*- coding: utf-8 -*-
from flask import Flask, jsonify, request
import dentalScraper
from flask_cors import CORS
app = Flask(__name__)
cors = CORS(app)
scraper = dentalScraper
@app.route('/aia', methods=['POST'])
def AIAData():
    name = request.form['name']
    birth = request.form['birth']
    gender = request.form['gender']
    return jsonify(scraper.getAIAData(name, birth, gender))

@app.route('/lina',methods=['POST'])
def LinaData():
    name = request.form['name']
    birth = request.form['birth']
    gender = request.form['gender']
    return jsonify(scraper.getLinaData(name, birth, gender))
app.run()