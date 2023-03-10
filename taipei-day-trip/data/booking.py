from flask import *
from unicodedata import name
import json
import mysql.connector
import mysql.connector.cursor
app = Flask(__name__,
            static_folder="templates",
            static_url_path="/static")

mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    # user="debian-sys-maint",
    passwd="mysqlpwd2022",
    # passwd="b6hdV6hWNuqadE2s",
    database="mysql"
)

mycursor = mydb.cursor()
mycursor.execute("CREATE DATABASE IF NOT EXISTS TaipeiAttractionsDB")
mydb.commit()
mycursor.close()
mydb.close()

mydb = mysql.connector.connect(
    host="localhost",
    # user="root",
    user="debian-sys-maint",
    # passwd="mysqlpwd2022",
    passwd="b6hdV6hWNuqadE2s",
    database="TaipeiAttractionsDB"
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

# python booking.py
