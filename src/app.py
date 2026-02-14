import os
from flask import Flask, render_template 
from flask_migrate import Migrate
from database import db


def create_app():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    app = Flask(__name__, template_folder=os.path.join(base_dir, 'templates'), static_folder=os.path.join(base_dir, 'static')) 
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(base_dir, "instance", "expenses.db")}'

    db.init_app(app)

    # Import routes with CRUD logic 
    from routes import  register_routes
    register_routes(app, db)

    migrate = Migrate(app, db)

    return app 

