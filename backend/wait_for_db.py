import socket
import time
import os

host = os.environ.get('DB_HOST', 'db')
port = int(os.environ.get('DB_PORT', 5432))

print(f"Waiting for database at {host}:{port}...")
while True:
    try:
        with socket.create_connection((host, port), timeout=2):
            print("Database is up!")
            break
    except OSError:
        print("Database not ready yet, retrying...")
        time.sleep(1)
