// Start of the week 
let currentMonday = getMonday(new Date());

// Categoires color scheme
const categoryColors = {
    'Transport': '#3b82f6',  // Blue
    'Food': '#f59e0b',       // Amber/Orange
    'Leisure': '#a855f7', // Purple
    'Other': '#6b7280'       // Gray
};

// Data Fetching 
async function fetchExpenses(startDate) { 
    const response = await fetch(`/api/expenses/${startDate}`);
    const expenses = await response.json();
    return expenses;
}

// Core Logic 
async function loadExpenses() {

    const weekDates = getWeekDates(currentMonday);  // a list of weekdays starting from monday (strings)
    const startDate = weekDates[0];                 // Monday 
    const endDate = weekDates[6];                   // Sunday 

    // Display current date range 
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate); 
    const startDateOptions = {month: 'short', day: 'numeric'};
    const endDateOptions = {day: 'numeric'};
    const year = endDateObj.getFullYear();
    let space = '';

    if (startDateObj.getMonth() !== endDateObj.getMonth()) {
        endDateOptions['month'] = 'short';
        space = ' ';
    } 

    const firstDate = startDateObj.toLocaleString('en-US', startDateOptions);
    const lastDate = endDateObj.toLocaleString('en-US', endDateOptions)
    document.getElementById('date-range-display').textContent = `${firstDate}${space}-${space}${lastDate} ${year}`


    // Get this week's expenses 
    const expenses = await fetchExpenses(startDate);


    try {

        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        let grandTotal = 0;     

        days.forEach((dayName, index) => {
            // Get the day's expenses container and its total 
            const container = document.getElementById(`${dayName}-expenses`);
            const totalDisplay = document.getElementById(`${dayName}-total`);
            const dateDisplay = document.getElementById(`${dayName}-date`);

            const targetDate = weekDates[index]

           if (dateDisplay) {
                // Formatting date for UI (e.g., "Jan 12")
                const d = new Date(targetDate + 'T00:00:00'); // Adding time prevents timezone shift
                dateDisplay.textContent = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }

            // Match expenses to the specific day column
            const dayExpenses = expenses.filter(exp => exp.date === targetDate);
            const dayTotal = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
            grandTotal += dayTotal; 

            if (totalDisplay) totalDisplay.textContent = `€${dayTotal.toFixed(2)}`;

            if (container) {
                container.innerHTML = dayExpenses.map(exp => {
                    
                    const color = categoryColors[exp.category]; 

                    return `
                        <div onclick="handleExpenseClick(this, event)" class="expense-item d-flex justify-content-between small border-bottom py-1" id="${exp.id}">
                            <div>
                                <span class="expense-category" style="background-color: ${color};">${exp.category}</span>
                                <span class="expense-description">${exp.description}</span>
                            </div>
                            <div class="d-flex align-items-center">
                                <span class="expense-amount fw-bold">€${exp.amount.toFixed(2)}</span>
                                <button class="ms-2 btn-delete" style="display: none;" onclick="deleteExpense(this,event)">
                                    <img src="/static/images/bin.png" alt="Delete" style="width: 18px; height: 18px;">
                                </button>
                            </div>
                        </div>
                    `;
                    
                }).join('') || '<p class="text-muted small italic m-0">No expenses</p>';
            }
        });

        // Update the total of current week 
        document.getElementById('total-amount').textContent = `€${grandTotal.toFixed(2)}`;
    
    } catch (error) {
        console.log('error')
    }

}


/*              */ 
/* Date Helpers */ 
/*              */ 

// Finds the Monday of the week for any given date
function getMonday(d) {
    const date = new Date(d);
    const day = date.getDay();
    // Logic to find the most recent Monday
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
}

function getWeekDates(monday) {
    const week = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        week.push(d.toISOString().split('T')[0]); // Returns "YYYY-MM-DD"
    }
    return week;
}


/*                     */ 
/* Week Toggling Logic */ 
/*                     */ 


async function changeWeek(direction) {
    // Shift the currentMonday date by 7 days
    currentMonday.setDate(currentMonday.getDate() + (direction * 7));

    // Select all day cards and total amount to animate them 
    const cards = document.querySelectorAll('.day-card');
    const total_amount = document.getElementById('total-amount');
    // Determine direction of the animation
    const animationClass = direction > 0 ? 'slide-in-right' : 'slide-in-left';

    cards.forEach(card => {
        // Remove old animations first
        total_amount.classList.remove('slide-in-right', 'slide-in-left');
        card.classList.remove('slide-in-right', 'slide-in-left');
        
        // Trigger a reflow 
        void card.offsetWidth; 
        void total_amount.offsetWidth;
        
        // Add the new animation
        card.classList.add(animationClass);
        total_amount.classList.add(animationClass);
    });

    // Update UI 
    await loadExpenses();
}

/*  Editing and Adding New Expenses  */

let activeCard = null;  // global variable for opened card

function handleCardClick(card, event) {
    // If same card was clicked, return 
    if (activeCard === card) return;
    // If a different card was opened, close active card 
    if (activeCard && card !== activeCard) {
        closeCard(activeCard);
    }
    // Open new card
    openCard(card);  
    
    event.stopPropagation();
}

function handleOutsideClick(event) {
    // if there is an active card, and if active card DOES NOT contain clicked target
    if (activeCard && !activeCard.contains(event.target)) {
        closeCard(activeCard);
        document.removeEventListener('click', handleOutsideClick);
    }
}

function openCard(card) {
    activeCard = card; 
    // Show new expense editor
    const editor = card.querySelector(".inline-editor");
    editor.style.display = 'block'; 
    // Show delete-buttons on expenses 
    const deleteButtons = card.querySelectorAll('.btn-delete');
    deleteButtons.forEach(btn => {
        btn.style.display = 'block';
    });
    
    document.addEventListener('click', handleOutsideClick);
}

function closeCard(card) {
    activeCard = null;
    // Hide new expesne editor 
    const editor = card.querySelector(".inline-editor");
    if (editor) editor.style.display = 'none';
     // Hide delete-buttons on expenses 
    const deleteButtons = card.querySelectorAll('.btn-delete');
    deleteButtons.forEach(btn => {
        btn.style.display = 'none';
    });
    
}


// Triggers on clicking save expense button 
async function saveNewExpense(button, event) { 
    // Stops card from reacting on this click 
    event.stopPropagation();
    // Find the card
    const card = button.closest('.day-card');

    // Get elements to parse values from them 
    const categoryElem = card.querySelector('.edit-category');
    const descriptionElem = card.querySelector('.edit-description');
    const amountElem = card.querySelector('.edit-amount');

    if (!categoryElem.value || !amountElem.value) {
        alert("Plesase fill in all fields before adding.");
        return; 
    }

    // Getting expense's date
    const dayName = card.dataset.day;
    const weekDates = getWeekDates(currentMonday);
    const dayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].indexOf(dayName);
    const date = weekDates[dayIndex];


    const payload = { 
        date: date,
        category: categoryElem.value,
        description: descriptionElem.value,
        amount: amountElem.value
    }

    try {
        const response = await fetch('/api/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to add expense');

        // Clear values in fields 
        categoryElem.value = '';
        descriptionElem.value = '';
        amountElem.value = '';
        // Close card and refresh the page 
        closeCard(card);
        await loadExpenses();

    } catch (error) {
        console.error('Error saving expense', error);
    }
}

// Triggers on clicking delete expense button 
async function deleteExpense(button, event) {
    // Stops card from reacting on this click 
    event.stopPropagation();

    const expense = button.closest('.expense-item');
    const expense_id = expense.id; 
    console.log(expense_id);

    // API Logic
    try {
        const response = await fetch(`/api/delete/${expense_id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to add expense');

        // Delete expense element from card 
        const card = expense.closest('.day-card'); 
        expense.remove();
        await loadExpenses();
        openCard(card);

    } catch (error) {
        console.error('Error deleting expense', error);
    }
}


function handleExpenseClick(element, event) {
    event.stopPropagation(); 
    const modal = document.querySelector("#editModal");
    // Get the date
    const card = element.closest('.day-card');
    const dayName = card.dataset.day;
    const weekDates = getWeekDates(currentMonday);
    const dayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].indexOf(dayName);
    const date = weekDates[dayIndex];
    // Save expense's Id and date on the modal 
    modal.dataset.expenseId = element.id; 
    modal.dataset.date = date;
    let category = element.querySelector('.expense-category').innerText; 
    const description = element.querySelector('.expense-description').innerText; 
    const amount = element.querySelector('.expense-amount').innerText.replace('€', ''); 
    // Reformat category
    category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

    // Show modal 
    modal.style.display = 'flex';
    // Put existing values in the modal's fields 
    document.querySelector('#editCategory').value = category;
    document.querySelector('#editDescription').value = description;
    document.querySelector('#editAmount').value = amount;
    
    
}

function closeModal() {
    document.querySelector("#editModal").style.display = 'none';
}


async function editExpense(element) {
    const modal = document.querySelector("#editModal");
    const expenseId = modal.dataset.expenseId; 
    const date = modal.dataset.date; 

    const category = document.querySelector('#editCategory').value;
    const description = document.querySelector('#editDescription').value;
    const amount = document.querySelector('#editAmount').value;
    

     if (!category || !amount) {
        alert("Plesase fill in all fields before adding.");
        return; 
    }

    const updatedExpense = {
        date: date,
        category: category,
        description: description,
        amount: amount
    };

    try {
        const response = await fetch(`/api/edit/${expenseId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedExpense)
        });

        if (!response.ok) throw new Error('Failed to add expense');
        else {
            // Close edit window and update expense 
            closeModal();          
            await loadExpenses();
        }

    } catch (error) {
        console.error('Error editing expense', error);
    }
    
}

// Run this when application is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('MoneyMap loaded')
    await loadExpenses();
});

