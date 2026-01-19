from flask import Flask, render_template 

expenses = []

def create_app():

    app = Flask(__name__, template_folder='templates', static_folder='static') 

    # Import routes with CRUD logic 
    from routes import  register_routes
    register_routes(app, expenses)

    return app 

