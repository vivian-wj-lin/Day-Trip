import json
import flask
import mysql
import mysql.connector
import mysql.connector.cursor
import jwt
import time
import requests


from datetime import datetime
from mysql.connector import pooling
from mysql.connector import connect
from mysql.connector import Error
from unicodedata import name

from flask import *
from flask import Flask, request

app = Flask(__name__, static_folder="templates", static_url_path="/static")
app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.secret_key = "secret"

IS_LOGIN = "isLogin..."
JWT_KEY = 'secret'
COOKIE_KEY_JWT_TOKEN = 'hijkl'

cnxpool = pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=10,
    host='localhost',
    database='TaipeiAttractionsDB',
    user='root',
    # user="debian-sys-maint",
    password='mysqlpwd2022'
    # passwd="b6hdV6hWNuqadE2s",
    # auth_plugin='mysql_native_password'
)

# Pages


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/attraction/<id>")
def attraction(id):
    return render_template("attraction.html")


@app.route("/booking")
def booking():
    return render_template("booking.html")


@app.route("/thankyou")
def thankyou():
    return render_template("thankyou.html")


@app.route("/api/categories")
def api_categories():

    try:
        # cursor = mydb.cursor()
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        cursor.execute("SELECT DISTINCT category FROM Attractions")
        data = cursor.fetchall()
        data = [x[0] for x in data]
        cursor.close()
        cnx.close()
        return {"data": data}
    except Exception:
        return Response(
            json.dumps({"error": True, "message": "Internal Server Error"}),
            mimetype="application/json",
            status=500,
        )


@app.route("/api/attraction/<attractionId>")
def api_attractionId(attractionId):
    try:
        cnx = cnxpool.get_connection()
        att_cursor = cnx.cursor(dictionary=True)
        # att_cursor = mydb.cursor(dictionary=True)
        sql = """
                SELECT source_id,name,category,description,address,transport,mrt,lat,lng
                FROM Attractions
                WHERE source_id = %s
                ;
                """
        val = (attractionId,)
        att_cursor.execute(sql, val)
        attraction = att_cursor.fetchone()

        if attraction is None:
            return Response(
                json.dumps({"error": True, "message": "Wrong attraction ID"}),
                mimetype="application/json",
                status=400,
            )

        # if attractionId exists in database
        img_cursor = cnx.cursor(dictionary=True)
        sql = """
                SELECT *
                FROM Images
                WHERE source_id = %s
                ;
                """
        val = (attractionId,)
        img_cursor.execute(sql, val)
        images = img_cursor.fetchall()
        images = [x["images"] for x in images]
        attraction["images"] = images
        att_cursor.close()
        img_cursor.close()
        cnx.close()
        return {
            "data": attraction,
        }
    except Exception:
        return Response(
            json.dumps({"error": True, "message": "Internal Server Error"}),
            mimetype="application/json",
            status=500,
        )


@app.route("/api/attractions")
def api_attractions():
    try:
        page = flask.request.args.get("page")
        keyword = flask.request.args.get("keyword")

        # page is required
        if page is None:
            return {"error": True, "message": "Please enter page number"}
        if page.isdigit() is False:
            return {"error": True, "message": "Please enter page number"}

        page = int(page)

        # without keywords
        if keyword is None:
            cnx = cnxpool.get_connection()
            att_cursor = cnx.cursor(dictionary=True)
            sql = """
                    SELECT source_id,name,category,description,address,transport,mrt,lat,lng
                    FROM Attractions
                    LIMIT 12 OFFSET %s
                    ;
                    """
            val = (page * 12,)
            att_cursor.execute(sql, val)
            attractions = att_cursor.fetchall()
            att_cursor.close()
            cnx.close()

        # with keywords
        else:
            cnx = cnxpool.get_connection()
            keyword_cursor = cnx.cursor(dictionary=True)
            sql = """
                    SELECT source_id,name,category,description,address,transport,mrt,lat,lng
                    FROM Attractions
                    WHERE category = %s or name like CONCAT("%",%s,"%")
                    LIMIT 12 OFFSET %s
                    ;
                    """
            val = (keyword, keyword, page * 12)
            keyword_cursor.execute(sql, val)
            attractions = keyword_cursor.fetchall()
            keyword_cursor.close()
            cnx.close()

        # composed with images
        for attraction in attractions:
            # img_cursor = mydb.cursor(dictionary=True)
            cnx = cnxpool.get_connection()
            img_cursor = cnx.cursor(dictionary=True)
            sql = """
                SELECT images
                FROM Images
                WHERE source_id = %s
                ;
            """
            val = (attraction["source_id"],)
            img_cursor.execute(sql, val)
            images = img_cursor.fetchall()
            images = [x["images"] for x in images]
            attraction["images"] = images
            img_cursor.close()
            cnx.close()

        # pagination
        if len(attractions) == 12:
            next_page = page+1
        else:
            next_page = None

        return {
            "nextPage": next_page,
            "data": attractions,
        }

    except Exception as e:
        print(e)
        return Response(
            json.dumps({"error": True, "message": "Internal Server Error"}),
            mimetype="application/json",
            status=500,
        )


@app.route("/api/user", methods=["POST"])
def signup():
    try:
        data = flask.request.get_json()
        name = data["name"]
        email = data["email"]
        password = data["password"]
        # 檢查帳號
        cnx_Users = cnxpool.get_connection()
        users_cursor = cnx_Users.cursor(dictionary=True)
        select_stmt = "SELECT * FROM Users WHERE email = %(email)s"
        users_cursor.execute(select_stmt, {"email": email})
        myresult = users_cursor.fetchall()
        if not myresult:
            signup_cursor = cnx_Users.cursor(dictionary=True)
            sql = "INSERT INTO Users (name,email,password) VALUES (%s, %s, %s)"
            val = [(name, email, password)]
            signup_cursor.executemany(sql, val)
            cnx_Users.commit()
            return flask.Response(
                json.dumps(
                    {
                        "ok": True,
                    }
                ),
                mimetype="application/json",
                status=200,
            )
        return flask.Response(
            json.dumps(
                {"error": True, "message": "duplicate email address or other errors"}
            ),
            mimetype="application/json",
            status=400,
        )
    except Exception:
        return flask.Response(
            json.dumps({"error": True, "message": "Internal Server Error"}),
            mimetype="application/json",
            status=500,
        )


@app.route("/api/user/auth")
def userInfo():
    encoded_jwt = flask.request.cookies.get(COOKIE_KEY_JWT_TOKEN)
    if encoded_jwt is None:
        return {"data": None}
        # return flask.Response(json.dumps({"data": None}),
        #                       mimetype="application/json",)
    user = jwt.decode(encoded_jwt, JWT_KEY, algorithms=[
                      "HS256"])
    return {"data": user}


@app.route("/api/user/auth", methods=["PUT"])
def login():
    data = flask.request.get_json()
    email = data["email"]
    password = data["password"]
    try:
        connection = cnxpool.get_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT id,name,email FROM Users WHERE email = %(email)s AND password = %(password)s",
            {"email": email, 'password': password},
        )
        user = cursor.fetchone()
        if user is None:
            return flask.Response(
                json.dumps(
                    {"error": True, "message": "failed to log in due to wrong email/password or other errors"}
                ),
                mimetype="application/json",
                status=400,
            )

        encoded_jwt = jwt.encode(payload=user, key=JWT_KEY, algorithm="HS256")
        response = flask.make_response({'ok': True})
        response.set_cookie(
            key=COOKIE_KEY_JWT_TOKEN,
            value=encoded_jwt,
            max_age=7 * 24 * 60 * 60,
        )
        return response
    except Exception:
        return flask.Response(
            json.dumps({"error": True, "message": "Internal Server Error"}),
            mimetype="application/json",
            status=500,
        )


@app.route("/api/user/auth", methods=["DELETE"])
def logout():
    response = flask.make_response({'ok': True})
    response.delete_cookie(key=COOKIE_KEY_JWT_TOKEN)
    return response


@app.route("/api/booking")
def cartInfo():
    encoded_jwt = flask.request.cookies.get(COOKIE_KEY_JWT_TOKEN)
    if encoded_jwt is None:
        return flask.Response(json.dumps({"error": True, "message": "Please log in"}),
                              mimetype="application/json", status=403,)

    return


app.run(host="0.0.0.0", debug=True, port=3000)

# python app.py
