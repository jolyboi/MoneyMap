from flask import render_template, jsonify, request
from datetime import datetime, timedelta

# hard coded expenses for now 
expenses = [
    {'id': 1, 'date': '2026-01-12', 'category': 'Transport', 'amount': 45.50, 'description': 'Bus fare'},  # Monday
    {'id': 2, 'date': '2026-01-13', 'category': 'Transport', 'amount': 60.00, 'description': ''},                        # Tuesday
    {'id': 3, 'date': '2026-01-14', 'category': 'Food', 'amount': 32.20, 'description': 'Lunch with friends'}, # Wednesday
    {'id': 4, 'date': '2026-01-15', 'category': 'Other', 'amount': 15.00, 'description': ''},                             # Thursday
    {'id': 5, 'date': '2026-01-16', 'category': 'Food', 'amount': 4.50, 'description': ''},                                  # Friday
    {'id': 6, 'date': '2026-01-16', 'category': 'Leisure', 'amount': 12.00, 'description': 'Movie'}, # Friday
    {'id': 7, 'date': '2026-01-17', 'category': 'Leisure', 'amount': 85.00, 'description': ''},                          # Saturday
    {'id': 8, 'date': '2026-01-18', 'category': 'Transport', 'amount': 2.50, 'description': 'Taxi home'},   # Sunday
    {'id': 9, 'date': '2026-01-20', 'category': 'Transport', 'amount': 2.50, 'description': 'Taxi home'}   # Sunday
]
last_id = 9
        

def register_routes(app, expenses):

    # Home Page 
    @app.route('/')
    def index(): 
        categories = ["Food", "Transport", "Leisure", "Other"]
        return render_template('index.html', categories=categories)

    # Returns a json of all expenses 
    @app.route('/api/expenses/<start_date>', methods=['GET'])
    def get_expenses(start_date):
        global expenses

        start = datetime.strptime(start_date, '%Y-%m-%d') # turn the string into Date object 
        end = start + timedelta(days=6)
        end_str = end.strftime('%Y-%m-%d')

        filtered = []
        for e in expenses: 
            if start_date <= e['date'] and e['date'] <= end_str:
                filtered.append(e)
 
        return jsonify(filtered)
    

    # Add expense 
    @app.route('/api/add', methods=['POST'])
    def add_expense(): 
        global expenses, last_id

        try:
            data = request.json
            expense = {
                    'id': last_id + 1,
                    'date': data['date'],
                    'category': data['category'],
                    'amount': float(data['amount']),
                    'description': data['description'],
                }
            last_id += 1
            expenses.append(expense)    # Will change for SQL 
            print(expenses)
            return jsonify(expense), 201
        
        except Exception as e:
            return jsonify({'error': 'Internal server error occured'}), 500
    

    @app.route('/api/delete/<id>', methods=['DELETE'])
    def delete_expense(id):
        global expenses 

        for i, expense in enumerate(expenses):
            if int(expense['id']) == int(id):
                deleted = expenses.pop(i)
                return jsonify(deleted), 200 
        
        return jsonify({'error': 'Expense not found'}), 500
    
    @app.route('/api/edit/<id>', methods=['PUT'])
    def edit_expense(id):
        global expenses 

        try:
            data = request.json
            edited_expense = {
                    'id': int(id),
                    'date': data['date'],
                    'category': data['category'],
                    'amount': float(data['amount']),
                    'description': data.get('description', ''),
                }

            for i, expense in enumerate(expenses):
                if int(expense['id']) == int(id):
                    expenses[i] = edited_expense
                    return jsonify(edited_expense), 200
            
            return jsonify({'error': 'Expense not found'}), 404

        except ValueError:
            return jsonify({'error': 'Invalid data format'}), 400 
        
        except Exception as e:
            return jsonify({'error': 'Internal server error occured'}), 500 