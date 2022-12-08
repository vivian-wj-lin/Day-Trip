import json
import flask
import mysql
import mysql.connector
import mysql.connector.cursor
import jwt

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

# try:
cnxpool = pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=5,
    host='localhost',
    database='TaipeiAttractionsDB',
    user='root',
    # user="debian-sys-maint",
    password='mysqlpwd2022'
    # passwd="b6hdV6hWNuqadE2s",
    # auth_plugin='mysql_native_password'
)

cnxpool_Users = pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=5,
    host='localhost',
    database='TpeAttUserDB',
    user='root',
    # user="debian-sys-maint",
    password='mysqlpwd2022'
    # passwd="b6hdV6hWNuqadE2s",
    # auth_plugin='mysql_native_password'
)


# mydb = mysql.connector.connect(
#     host="localhost",
#     user="root",
#     # user="debian-sys-maint",
#     passwd="mysqlpwd2022",
#     # passwd="b6hdV6hWNuqadE2s",
#     database="TaipeiAttractionsDB",
#     auth_plugin='mysql_native_password'
# )

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
    name = request.form["name"]
    email = request.form["email"]
    password = request.form["password"]
    # 檢查帳號
    cnx_Users = cnxpool_Users.get_connection()
    users_cursor = cnx_Users.cursor()(dictionary=True)
    select_stmt = "SELECT * FROM member WHERE email = %(email)s"
    users_cursor.execute(select_stmt, {"email": email})
    myresult = users_cursor.fetchall()
    if not myresult:
        signup_cursor = cnx_Users.cursor()(dictionary=True)
        sql = "INSERT INTO Users (name,email,password) VALUES (%s, %s, %s)"
        val = [(name, email, password)]
        signup_cursor.executemany(sql, val)
        cnx_Users.commit()
        return Response(
            json.dumps(
                {"ok": True, }),
            mimetype="application/json",
            status=200,
        )
    if myresult:
        return Response(
            json.dumps(
                {"error": True, "message": "duplicate email address or other errors"}),
            mimetype="application/json",
            status=400,
        )
    else:
        return Response(
            json.dumps(
                {"error": True, "message": "Internal Server Error"}),
            mimetype="application/json",
            status=500,
        )


@app.route("/api/user/auth")
def UserInfo():
    if session.get(IS_LOGIN, None):
        email = request.args.get("email")
        cnx_userInfo = cnxpool_Users.get_connection()
        userinfo_cursor = cnx_userInfo.cursor()(dictionary=True)
        select_stmt = "SELECT id, name, email FROM Users WHERE email = %(email)s"
        userinfo_cursor.execute(select_stmt, {"email": email})
        select_stmt = userinfo_cursor.fetchone()
        return {
            "data": {"id": select_stmt[0], "name": select_stmt[1], "email": select_stmt[2]}
        }
    else:
        return {"data": None}


@app.route("/api/user/auth", methods=["PUT"])
def jwtToken():
    email = request.args.get("email")
    password = request.args.get("password")
    # official example:
    # encoded_jwt = jwt.encode({"some": "payload"}, "secret", algorithm="HS256")
    # print(encoded_jwt)
    # jwt.decode(encoded_jwt, "secret", algorithms=["HS256"]){'some': 'payload'}


app.run(host="0.0.0.0", debug=True, port=3000)

# python app.py
