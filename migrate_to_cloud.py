"""
Cloud Database Setup & Migration Script for CP Management System
Usage:
    python migrate_to_cloud.py "mysql://user:password@host:port/dbname"
"""

import os
import sys
from urllib.parse import urlparse, unquote
import pymysql

def get_connection(db_url):
    if not db_url.startswith(("mysql://", "mysql+pymysql://")):
        print("[ERROR] Please provide a valid MySQL connection URL starting with mysql://")
        sys.exit(1)

    parsed = urlparse(db_url)
    host = parsed.hostname
    user = parsed.username
    password = unquote(parsed.password or "")
    database = parsed.path.lstrip("/") or "test"
    port = parsed.port or 3306

    ssl_config = None
    if any(k in (host or "").lower() for k in ["tidbcloud", "aivencloud", "railway", "clever"]) or os.getenv("DB_SSL", "").lower() in ("true", "1"):
        ssl_config = {"ca": None}

    print(f"[*] Connecting to {host}:{port}/{database} as user '{user}'...")
    con = pymysql.connect(
        host=host,
        user=user,
        password=password,
        database=database,
        port=port,
        ssl=ssl_config,
        autocommit=True,
        cursorclass=pymysql.cursors.DictCursor
    )
    return con

def migrate():
    if len(sys.argv) < 2:
        print("\n[INFO] Please run this script with your cloud database URL:")
        print('       python migrate_to_cloud.py "mysql://user:password@gateway...:4000/dbname"\n')
        sys.exit(1)

    db_url = sys.argv[1].strip("'\" ")
    try:
        con = get_connection(db_url)
        with con.cursor() as cur:
            cur.execute("SELECT 1 AS ok")
            print("[+] Connection verified successfully!")

            # Path to the backup dump
            sql_path = r"c:\Users\HP\Desktop\python\MYSQL\PROJECT\CP_Online_Web_Project_Exercise_Assignments_Fixed\CP_Online\database\backup_local_cerebral_palsy_db.sql"
            if not os.path.exists(sql_path):
                sql_path = r"c:\Users\HP\Desktop\python\MYSQL\PROJECT\CP_Online_Web_Project_Exercise_Assignments_Fixed\CP_Online\database\schema.sql"

            print(f"[*] Migrating schema & records from local backup...")
            with open(sql_path, "r", encoding="utf-8") as f:
                sql_content = f.read()

            statements = [s.strip() for s in sql_content.split(";") if s.strip()]
            success = 0
            for stmt in statements:
                try:
                    cur.execute(stmt)
                    success += 1
                except Exception as err:
                    if "already exists" not in str(err).lower():
                        print(f"[-] Notice: {err}")

            print(f"[+] Executed {success} statements.")
            cur.execute("SHOW TABLES")
            tables = [list(r.values())[0] for r in cur.fetchall()]
            print(f"\n[+] Successfully created {len(tables)} tables: {', '.join(tables)}")

        con.close()
        print("\n=======================================================")
        print("[SUCCESS] Your cloud database is now fully populated!")
        print("=======================================================")
    except Exception as e:
        print(f"\n[ERROR] Migration failed: {e}")

if __name__ == "__main__":
    migrate()
