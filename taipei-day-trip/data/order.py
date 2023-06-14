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
CREATE TABLE orders
(
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  orderNumber varchar(50) NOT NULL,
  userId int NOT NULL,
  attractionId int NOT NULL,
  selectedDate date not null,
  selectedTime char(50) not null,
  price int not null,
  contactName varchar(50) NOT null,
  contactEmail varchar(50) not null,
  contactPhone varchar(50) not null,
  status int DEFAULT 1
);
    '''
)

mycursor.close()
mydb.close()

