import pandas as pd
import pymongo

# Read the csv format and display head
traffic_stops_csv = pd.read_csv('data/Traffic_Stop_Cleaned_Data.csv')
print(traffic_stops_csv)

# Setup connection to mongodb
conn = "mongodb://localhost:27017"
client = pymongo.MongoClient(conn)

# Select database and collection to use
db = client.traffic_stops_db
collection = db.traffic_stops

traffic_stops_dict = traffic_stops_csv.to_dict('records')

# drop the database in case it exists
db.traffic_stops.drop()
db.traffic_stops.insert_many(traffic_stops_dict)

# confirm that the data is loaded into MongoDB
stops = db.traffic_stops.find({'Gender': 'Male'})
stops = list(stops)
print(stops)
print("Data Uploaded!")
