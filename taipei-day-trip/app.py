import json
import flask
import mysql
import mysql.connector
import mysql.connector.cursor
import jwt
import httpx

from mysql.connector import pooling
from mysql.connector.errors import Error
from contextlib import contextmanager

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


@contextmanager
def get_cursor(dictionary=True):
    cnx = cnxpool.get_connection()
    cursor = cnx.cursor(dictionary=dictionary)
    try:
        yield cursor
    finally:
        cursor.close()
        cnx.close()

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
        with get_cursor() as cat_cursor:
            cat_cursor.execute("SELECT DISTINCT category FROM Attractions")
            data = cat_cursor.fetchall()
        data = [x['category'] for x in data]
        return {"data": data}

    except Exception as e:
        print(e)
        return flask.Response(
            json.dumps({"error": True, "message": "Internal Server Error"}),
            mimetype="application/json",
            status=500,
        )


@app.route("/api/attraction/<attractionId>")
def api_attractionId(attractionId):

    try:
        with get_cursor() as att_cursor:
            sql = """
                    SELECT source_id,name,category,description,address,transport,mrt,lat,lng
                    FROM Attractions
                    WHERE source_id = %s
                    ;
                    """
            val = (attractionId,)
            att_cursor.execute(sql, val)
            attraction = att_cursor.fetchall()

        if attraction is None:
            return flask.Response(
                json.dumps({"error": True, "message": "Wrong attraction ID"}),
                mimetype="application/json",
                status=400,
            )

        # if attractionId exists in database
        with get_cursor() as img_cursor:
            sql = """
                    SELECT *
                    FROM Images
                    WHERE source_id = %s
                    ;
                    """
            val = (attractionId,)
            img_cursor.execute(sql, val)
            images = img_cursor.fetchall()
        # print(images)
        print(1)
        images = [x["images"] for x in images]
        print(2)
        # print(type(images))
        # print(type(attraction["images"]))
        print(attraction)
        print(type(attraction))  # list
        # attraction[0]["images"]
        attraction[0]["images"] = images
        print(images)
        print(type(images))  # list
        print(3)
        return {
            "data": attraction[0],
        }
        print(5)

        # fetchall 回傳 [{"images": ...}]
        # fetchone 回傳 {"images": ...}

    except Exception as e:
        print(e)
        return flask.Response(
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
        page = str(page)
        if page.isdigit() is False:
            return {"error": True, "message": "Please enter page number"}
        page = int(page)

        # without keywords
        if keyword is None:
            with get_cursor() as att_cursor:
                sql = """
                        SELECT source_id,name,category,description,address,transport,mrt,lat,lng
                        FROM Attractions
                        LIMIT 12 OFFSET %s
                        ;
                        """
                val = (page * 12,)
                att_cursor.execute(sql, val)
                attractions = att_cursor.fetchall()

        # with keywords
        else:
            with get_cursor() as keyword_cursor:
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

        # composed with images
        with get_cursor(False) as img_cursor:
            for attraction in attractions:
                sql = """
                    SELECT images
                    FROM Images
                    WHERE source_id = %s
                    ;
                """
                val = (attraction["source_id"],)
                img_cursor.execute(sql, val)
                images = img_cursor.fetchall()
                images = [x[0] for x in images]
                attraction["images"] = images

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
        return flask.Response(
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
        with get_cursor() as users_cursor:
            select_stmt = "SELECT * FROM Users WHERE email = %(email)s"
            users_cursor.execute(select_stmt, {"email": email})
            myresult = users_cursor.fetchall()
        if not myresult:
            cnx_Users = cnxpool.get_connection()
            signup_cursor = cnx_Users.cursor(dictionary=True)
            sql = "INSERT INTO Users (name,email,password) VALUES (%s, %s, %s)"
            val = [(name, email, password)]
            signup_cursor.executemany(sql, val)
            cnx_Users.commit()
            signup_cursor.close()
            cnx_Users.close()
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
    except Exception as e:
        print(e)
        return flask.Response(
            json.dumps({"error": True, "message": "Internal Server Error"}),
            mimetype="application/json",
            status=500,
        )


@app.route("/api/user/auth")
def userInfo():
    try:
        encoded_jwt = flask.request.cookies.get(COOKIE_KEY_JWT_TOKEN)
        if encoded_jwt is None:
            return {"data": None}
        user = jwt.decode(encoded_jwt, JWT_KEY, algorithms=["HS256"])
        return {"data": user}
    except Exception as e:
        print(e)
        return flask.Response(
            json.dumps({"error": True, "message": "Internal Server Error"}),
            mimetype="application/json",
            status=500,
        )


@app.route("/api/user/auth", methods=["PUT"])
def login():
    try:
        data = flask.request.get_json()
        email = data["email"]
        password = data["password"]
        with get_cursor() as cursor:
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
    except Exception as e:
        print(e)
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


def get_userinfo():
    encoded_jwt = flask.request.cookies.get(COOKIE_KEY_JWT_TOKEN)
    if encoded_jwt is None:
        return
    user = jwt.decode(encoded_jwt, JWT_KEY, algorithms=["HS256"])
    return user


@app.route("/api/booking", methods=["POST"])
def book():
    user = get_userinfo()
    if user is None:
        return flask.Response(
            json.dumps({"error": True, "message": "Please log in"}),
            mimetype="application/json",
            status=403,
        )
    data = flask.request.get_json()
    attractionId = data["attractionId"]
    date = data["date"]
    time = data["time"]
    price = data["price"]
    cnx = cnxpool.get_connection()
    cursor = cnx.cursor(dictionary=True)
    try:
        cursor.execute(
            '''INSERT INTO Booking (userId,attractionId,date,time,price) VALUES (%s,%s,%s,%s,%s)''',
            (user['id'], attractionId, date, time, price),
        )
        cnx.commit()
        cursor.close()
        cnx.close()
        return flask.Response(
            json.dumps({"ok": True, }),
            mimetype="application/json",
            status=200,
        )
    except mysql.connector.Error as e:
        print(e)
        if (e.errno == 1062):
            return flask.Response(
                json.dumps(
                    {"error": True, "message": "Reservation failed to established for duplicate orders or other reasons"}),
                mimetype="application/json",
                status=400,
            )

    return flask.Response(
        json.dumps(
            {"error": True, "message": "Internal Server Error"}),
        mimetype="application/json",
        status=500,
    )


@app.route("/api/booking")
def cartInfo():
    user = get_userinfo()
    if user is None:
        return flask.Response(
            json.dumps({"error": True, "message": "Please log in"}),
            mimetype="application/json",
            status=403,
        )
    print(1)
    with get_cursor() as cursor:
        cursor.execute(
            '''
            SELECT attractionId,DATE_FORMAT(date,'%Y-%m-%d') AS date,time,price
            FROM Booking 
            WHERE userId = %s
            ;''',
            (user["id"],),
        )
        booking_data = cursor.fetchone()
    if not booking_data:
        return flask.Response(
            json.dumps({"data": None}),
            mimetype="application/json",
            status=200,
        )
    print(2)
    attractionId = booking_data["attractionId"]
    print(3)
    del booking_data["attractionId"]
    print(4)
    with get_cursor() as cursor:
        cursor.execute(
            '''
            SELECT source_id AS id, name, address 
            FROM Attractions
            WHERE source_id = %s
            ;''',
            (attractionId,),
        )
        # attraction_data = cursor.fetchone()
        attraction_data = cursor.fetchall()
        print(5)
        # attraction_data = cursor.fetchmany()
        print(6)

    with get_cursor() as cursor:
        print(7)
        cursor.execute(
            '''
            SELECT images 
            FROM Images
            WHERE source_id = %s
            LIMIT 1
            ;''',
            (attractionId,),
        )
        print(8)
        # image_data = cursor.fetchone()
        image_data = cursor.fetchall()
        print(9)
        print(image_data)
        print(image_data[0]["images"])
        # image_data = cursor.fetchmany()
        print(10)

    booking_data["attraction"] = attraction_data
    print(11)
    # print(booking_data["attraction"])
    # print(booking_data["attraction"][0])
    print(image_data[0]["images"])
    # print(12)
    # print(booking_data["attraction"]["image"])
    print(12)
    print(image_data[0])
    # booking_data["attraction"]["image"] = image_data["images"]
    booking_data["attraction"][0]["image"] = image_data[0]["images"]
    print(13)
    return dict(data=booking_data)


@app.route("/api/booking", methods=["DELETE"])
def delete_booking():
    user = get_userinfo()
    if user is None:
        return flask.Response(
            json.dumps({"error": True, "message": "Please log in"}),
            mimetype="application/json",
            status=403,
        )

    cnx = cnxpool.get_connection()
    cursor = cnx.cursor(dictionary=True)
    cursor.execute(
        '''
        DELETE 
        FROM `Booking` 
        WHERE `userId` = %s
        ;''',
        (user['id'],),
    )
    cnx.commit()
    cursor.close()
    cnx.close()
    return flask.Response(
        json.dumps({"ok": True}),
        mimetype="application/json",
        status=200,
    )


@app.route('/api/orders', methods=["POST"])
def post_orders():
    data = flask.request.get_json()
    print(data)
    prime = data['prime']
    order = data['order']

    partner_key = 'partner_4p3zHkTBSMy1PoKS3URoIVUDEqFD2ApEYMbWJ1QO2JUPOo58zTj6KA5t'
    merchant_id = 'vtour22_CTBC'

    response = httpx.post(
        url="https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime",
        headers={
            'x-api-key': partner_key,
            # 'Content-Type': 'application/json',
        },
        # data=json.dumps(
        #     {
        #         "prime": prime,
        #         "partner_key": partner_key,
        #         "merchant_id": merchant_id,
        #         "details": "TapPay Test",
        #         "amount": order['price'],
        #         "cardholder": {
        #             "phone_number": order['contact']['phone'],
        #             "name": order['contact']['name'],
        #             "email": order['contact']['email'],
        #         },
        #         "remember": True,
        #     }
        # ),
        json={
            "prime": prime,
            "partner_key": partner_key,
            "merchant_id": merchant_id,
            "details": "TapPay Test",
            "amount": order['price'],
            "cardholder": {
                "phone_number": order['contact']['phone'],
                "name": order['contact']['name'],
                "email": order['contact']['email'],
            },
            "remember": True,
        },
    )
    payment_data = response.json()

    # insert to table
    # cnx = cnxpool.get_connection()
    # cursor = cnx.cursor(dictionary=True)
    # try:
    #     cursor.execute(
    #         '''INSERT INTO orders
    #         (userId,attractionId,selectedDate,selectedTime,price,contactName,contactEmail,contactPhone)
    #         VALUES (%s,%s,%s,%s,%s,%s,%s,%s)''',
    #         (userid, attractionId, date, time,
    #          price, order['contact']['name'], order['contact']['email'], order['contact']['name']),
    #     )
    #     cnx.commit()
    #     cursor.close()
    #     cnx.close()
    #     return flask.Response(
    #         json.dumps({"ok": True, }),
    #         mimetype="application/json",
    #         status=200,
    #     )
    # except mysql.connector.Error as e:
    #     print(e)

    # return flask.Response(
    #     json.dumps(
    #         {"error": True, "message": "Internal Server Error"}),
    #     mimetype="application/json",
    #     status=500,
    # )
    # response to FE

    return {}


app.run(host="0.0.0.0", debug=True, port=3000)

# python app.py
