from flask import render_template, jsonify, request
from models import Expense
from datetime import datetime, timedelta


def register_routes(app, db):

    # Home Page 
    @app.route('/')
    def index(): 
        categories = ["Food", "Transport", "Leisure", "Other"]
        return render_template('index.html', categories=categories)

    # Returns a json of all expenses 
    @app.route('/api/expenses/<start_date>', methods=['GET'])
    def get_expenses(start_date):

        start = datetime.strptime(start_date, '%Y-%m-%d').date() # turn the string into Date object 
        end = start + timedelta(days=6)
        # end_str = end.strftime('%Y-%m-%d')

        # Filter expenses based on starting day 
        filtered_expenses = Expense.query.filter(
            Expense.date >= str(start), 
            Expense.date <= str(end)
        ).all() 
 
        return jsonify([{
            'id': e.id,
            'date': e.date, 
            'category': e.category,
            'amount': e.amount,
            'description': e.description
        } for e in filtered_expenses])
    

    # Add expense 
    @app.route('/api/add', methods=['POST'])
    def add_expense(): 

        try:
            data = request.json


            expense_sql = Expense(
                amount=float(data['amount']),
                category=data['category'],
                date=data['date'],
                description=data.get('description', '') 
            )

            db.session.add(expense_sql)
            db.session.commit() 

            return jsonify({
                'message': 'Expense added successfully'
            }), 201
        
        except Exception as e:
            db.session.rollback() 
            return jsonify({'error': str(e)}), 500
    

    @app.route('/api/delete/<int:id>', methods=['DELETE'])
    def delete_expense(id): 
        expense = Expense.query.get(id)
        if not expense:
            return jsonify({'error': 'Expense not found'}), 404

        try: 
            db.session.delete(expense)
            db.session.commit()
            return jsonify({'message': 'Expense deleted successfully'}), 200
        except Exception as e: 
            db.session.rollback() 
            return jsonify({'error': 'Database error'}), 500
    
    

    @app.route('/api/edit/<int:id>', methods=['PUT'])
    def edit_expense(id):
        expense = Expense.query.get(id)
        if not expense:
            return jsonify({'error': 'Expense not found'}), 404

        try:
            data = request.json
         
            expense.date = data['date']
            expense.category = data['category']
            expense.amount = float(data['amount'])
            expense.description = data.get('description', '')

            db.session.commit() 
            

            
                
            return jsonify({'message': 'Expense updated successfully'}), 200
            

        except ValueError:
            db.session.rollback() 
            return jsonify({'error': 'Invalid data format'}), 400 
        
        except Exception as e:
            db.session.rollback() 
            return jsonify({'error': 'Internal server error occured'}), 500 
        
