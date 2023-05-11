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

