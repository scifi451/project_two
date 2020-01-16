from flask import Flask, render_template, jsonify
import pymongo
import json


app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] =0


# setup mongo connection
conn = "mongodb://localhost:27017"
client = pymongo.MongoClient(conn)

# connect to mongo db and collection
db = client.traffic_stops_db
collection = db.traffic_stops

#**********************************
#        Set up the routes         
#**********************************
# html pages
@app.route("/")
def IndexRoute():
    """This function runs when the browser loads the index route"""
    
    webpage = render_template('index.html')
    return webpage

# Data routes
@app.route("/trafficdata")
def trafficdata():
    # Need to handle the issue with the _id field in MongoDB 
    # It is throwing an error in jsonify
    stops = []
    for stop in db.traffic_stops.find():
        stop.pop('_id')
        stop.pop('Unnamed: 0')
        stops.append(stop)
    return jsonify(stops)
# limit to only the 100 records
@app.route("/trafficdata100")
def trafficdata100():
    #Limiting the results to 100 for testing due to latency
    stops = []
    for stop in db.traffic_stops.find().limit(100):
        stop.pop('_id')
        stop.pop('Unnamed: 0')
        stops.append(stop)
    return jsonify(stops)

if __name__ == "__main__":
    app.run(debug=True)
