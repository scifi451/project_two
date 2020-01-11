from flask import Flask, render_template, jsonify
import pymongo
import json


app = Flask(__name__)

# setup mongo connection
conn = "mongodb://localhost:27017"
client = pymongo.MongoClient(conn)

# connect to mongo db and collection
db = client.traffic_stops_db
collection = db.traffic_stops


@app.route("/trafficdata.json")
def index():
    # write a statement that finds all the items in the db and sets it to a variable
    traffic_stops = list(db.traffic_stops.find())
    attributes = ["Year", "Date", "Race", "Gender", "DriverSearched", "VehicleSearched", "Citation", "Reason", "Grid", "Location"]
    output = [{atr: traffic_stop[atr] for atr in attributes} for traffic_stop in traffic_stops]
    return json.dumps(output)

if __name__ == "__main__":
    app.run(debug=True)
