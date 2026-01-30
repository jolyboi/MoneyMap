from flask import Flask, render_template 
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate


db = SQLAlchemy()
# expenses = []


def create_app():
    app = Flask(__name__, template_folder='templates', static_folder='static') 
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///expenses.db'

    db.init_app(app)

    # Import routes with CRUD logic 
    from routes import  register_routes
    register_routes(app, db)

    migrate = Migrate(app, db)

    return app 

