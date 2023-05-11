from flask import *
from unicodedata import name
import json
import mysql.connector
import mysql.connector.cursor
app = Flask(__name__,
            static_folder="templates",
            static_url_path="/")

file = open("taipei-attractions.json", "r", encoding="UTF-8")
dict_data = json.load(file)
attractions_list = dict_data["result"]["results"]

results = []
for attraction in attractions_list:
    images_result = []
    images = str(attraction["file"]).split("https://")
    for image in images[1: (len(images))]:
        if image.split(".")[-1].lower() in ["jpg", "png"]:
            images_result.append("https://" + image)
    results.append(
        {
            "id": attraction["_id"],
            "name": attraction["name"],
            "category": attraction["CAT"],
            "description": attraction["description"],
            "address": attraction["address"],
            "transport": attraction["direction"],
            "mrt": attraction["MRT"],
            "lat": attraction["latitude"],
            "lng": attraction["longitude"],
            "images": images_result,
        }
    )


mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    passwd="mysqlpwd2022",
    database="mysql"
)

mycursor = mydb.cursor()
mycursor.execute("CREATE DATABASE IF NOT EXISTS TaipeiAttractionsDB")
mydb.commit()
mycursor.close()
mydb.close()

mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    passwd="mysqlpwd2022",
    database="TaipeiAttractionsDB"
)
mycursor = mydb.cursor()
mycursor.execute(
    '''
    CREATE Table IF NOT EXISTS Attractions
    (
        id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
        source_id int NOT NULL,
        `name` varchar(100) NOT NULL,
        category varchar(100) NOT NULL,
        `description` varchar(5000) NOT NULL,
        address varchar(500) NOT NULL,
        transport varchar(1000) NOT NULL,
        mrt varchar(500),
        lat int NOT NULL,
        lng int NOT NULL,
        INDEX(source_id)
    );
    '''
)
mydb.commit()
mycursor = mydb.cursor()
mycursor.execute(
    '''
    CREATE Table IF NOT EXISTS Images
    (
        img_id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        source_id int NOT NULL,
        images varchar(10000) NOT NULL,
        FOREIGN KEY (source_id) REFERENCES Attractions(source_id)
    );
    '''
)
mydb.commit()

# insert values into table Attractions
for result in results:
    source_id = (result["id"])
    name = (result["name"])
    category = (result["category"])
    description = (result["description"])
    address = (result["address"])
    transport = (result["transport"])
    mrt = (result["mrt"])
    lat = (result["lat"])
    lng = (result["lng"])
    mycursor = mydb.cursor()
    sql = "INSERT INTO Attractions (source_id,name, category, description,address,transport,mrt,lat,lng) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
    val = [(source_id, name, category, description,
            address, transport, mrt, lat, lng)]
    mycursor.executemany(sql, val)
    mydb.commit()

# insert values into table Images
for result in results:
    source_id = (result["id"])
    images = (result["images"])
    for image in images:
        mycursor = mydb.cursor()
        sql = "INSERT INTO Images (source_id,images) VALUES (%s, %s)"
        val = [(source_id, image)]
        mycursor.executemany(sql, val)
        mydb.commit()

mycursor.close()
mydb.close()
file.close()
