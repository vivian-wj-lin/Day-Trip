from flask import Flask
from unicodedata import name
from dotenv import dotenv_values

import mysql.connector
import mysql.connector.cursor
import os

app = Flask(__name__,
            static_folder="templates",
            static_url_path="/static")

env = dotenv_values(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

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
    CREATE Table IF NOT EXISTS Users
    (
        id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
        `name` varchar(100) NOT NULL,
        email varchar(100) UNIQUE NOT NULL,
        password char(20) not null
    );
    '''
)
mydb.commit()
mycursor.close()
mydb.close()
