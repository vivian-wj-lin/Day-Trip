from flask import *
from unicodedata import name
from dotenv import dotenv_values

import json
import mysql.connector
import mysql.connector.cursor

app = Flask(__name__,
            static_folder="templates",
            static_url_path="/static")

env = dotenv_values(".env")

mydb = mysql.connector.connect(
    host=env["DB_HOST"],
    user=env["DB_USER"],
    passwd=env["DB_PASSWORD"],
    database="mysql"
)

mycursor = mydb.cursor()
mycursor.execute("CREATE DATABASE IF NOT EXISTS TaipeiAttractionsDB")
mydb.commit()
mycursor.close()
mydb.close()

mydb = mysql.connector.connect(
    host=env["DB_HOST"],
    user=env["DB_USER"],
    passwd=env["DB_PASSWORD"],
    database=env["DB_DATABASE"]
)
mycursor = mydb.cursor()
mycursor.execute(
    '''
    CREATE Table IF NOT EXISTS Booking
    (
        id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
        userId int UNIQUE NOT NULL,
        attractionId int NOT NULL,
        date DATE NOT NULL,
        time char(20) not null,
        price int not null
    );
    '''
)
mydb.commit()
mycursor.close()
mydb.close()

