import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask,send_from_directory
from flask_cors import CORS
from Routes.schedule import schedule_bp
from Routes.data import data_bp
from Routes.compare import compare_bp

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend')

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
CORS(app)

@app.route('/')
def index():
    return send_from_directory(FRONTEND_DIR, 'index.html')

app.register_blueprint(schedule_bp)
app.register_blueprint(compare_bp)
app.register_blueprint(data_bp)

if __name__ == "__main__":
    app.run(debug=True, port=5000)