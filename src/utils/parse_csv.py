import io 
import csv 
import datetime

def parse_csv(file): 
    """
    Takes a CSV file from Flask backend, parses it and
    returns a list of dictionaries (expenses)

    Args: A CSV File exported from a bank app (Revolut).
    Expected file's fields: Completed Date, Description, Amount
    Date Format: str, yyyy-mm-dd
    """
    raw_data = file.stream.read().decode('utf-8')
    stream = io.StringIO(raw_data)

    csv_input = csv.DictReader(stream)

    expenses = []

    print('analyzing...')

    for row in csv_input: 
        # Parse values
        date = row.get("Completed Date")
        description = row.get('Description')
        amount = row.get('Amount')
       
        # Validate amount 
        try:
            amount = float(amount)
            if amount >= 0:
                continue 
            amount = abs(amount)
        
        except ValueError as e:
            print(f'Error validating expense: {e}')
            continue
 
        # Validate date (expected format: yyyy-mm-dd)
        try: 
            if not date:
                continue
            # Parse and validate date format
            date = datetime.datetime.strptime(date, '%Y-%m-%d %H:%M:%S')
        except ValueError as e:
            print(f'Error validating date: {e}')
            continue


        # Clean descriotion string 
        description = description.strip() if description else '' 


        # Create expense 
        expense = {
            'date': datetime.datetime.strftime(date, '%Y-%m-%d'),
            'description': description,
            'amount': amount,
        }
        # Add expense
        expenses.append(expense)

    print('Expenses parsed successfully')
    print(expenses)
        
    return expenses