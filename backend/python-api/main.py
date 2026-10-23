import os
from typing import List, Optional

import pymysql
import pymysql.cursors
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

DB_HOST = os.environ["DB_HOST"]
DB_USER = os.environ["DB_USER"]
DB_PASSWORD = os.environ["DB_PASSWORD"]
DB_NAME = os.environ["DB_NAME"]
PHP_SERVICE_URL = os.environ["PHP_SERVICE_URL"]
PHP_SERVICE_API_KEY = os.environ["PHP_SERVICE_API_KEY"]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


class Product(BaseModel):
    ID: int
    ProductName: str
    Description: Optional[str]
    Price: float
    ImageUrl: Optional[str]


def db_connection():
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor,
        connect_timeout=5,
    )


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/products", response_model=List[Product])
def products():
    conn = db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT ID, ProductName, Description, Price, ImageUrl FROM products")
            return cur.fetchall()
    finally:
        conn.close()


@app.get("/api/php-check")
def php_check():
    try:
        resp = requests.get(
            PHP_SERVICE_URL + "/health.php",
            headers={"X-API-Key": PHP_SERVICE_API_KEY},
            timeout=3,
        )
        if resp.status_code == 200:
            return {"php": resp.json()}
    except (requests.RequestException, ValueError):
        pass
    return JSONResponse(
        status_code=502,
        content={"status": "error", "detail": "php-service unreachable"},
    )
