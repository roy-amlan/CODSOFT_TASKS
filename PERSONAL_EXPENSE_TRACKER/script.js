// FINORA PERSONAL FINANCE MANAGER

// SELECT HTML ELEMENTS

const transactionForm = document.getElementById("transactionForm");
const transactionModal = document.getElementById("transactionModal");

const openModal = document.getElementById("openModal");
const openModal2 = document.getElementById("openModal2");
const closeModal = document.getElementById("closeModal");
const cancelModal = document.getElementById("cancelModal");

const transactionList = document.getElementById("transactionList");

const totalBalance = document.getElementById("totalBalance");
const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const totalTransactions = document.getElementById("totalTransactions");

const transactionTitle = document.getElementById("transactionTitle");
const transactionAmount = document.getElementById("transactionAmount");
const transactionType = document.getElementById("transactionType");
const transactionCategory = document.getElementById("transactionCategory");
const transactionDate = document.getElementById("transactionDate");

const editId = document.getElementById("editId");
const modalTitle = document.getElementById("modalTitle");
const saveButton = document.getElementById("saveButton");

const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const categoryFilter = document.getElementById("categoryFilter");


// LOAD DATA FROM LOCAL STORAGE

let transactions = JSON.parse(
    localStorage.getItem("finoraTransactions")
) || [];


// CURRENCY FORMAT

function formatCurrency(amount) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(amount);

}


// CURRENT DATE

document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });


// OPEN MODAL

function showModal() {

    transactionForm.reset();

    editId.value = "";

    modalTitle.textContent = "Add Transaction";

    saveButton.textContent = "Save Transaction";

    transactionDate.value = new Date().toISOString().split("T")[0];

    transactionModal.classList.add("show");

}

openModal.addEventListener("click", showModal);
openModal2.addEventListener("click", showModal);


// CLOSE MODAL

function hideModal() {

    transactionModal.classList.remove("show");

    transactionForm.reset();

    editId.value = "";

}

closeModal.addEventListener("click", hideModal);
cancelModal.addEventListener("click", hideModal);


// SAVE TRANSACTION

transactionForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const title = transactionTitle.value.trim();
    const amount = Number(transactionAmount.value);
    const type = transactionType.value;
    const category = transactionCategory.value;
    const date = transactionDate.value;

    if (!title || !Number.isFinite(amount) || amount <= 0 || !date) {

        alert("Please enter valid transaction details.");

        return;

    }

    if (editId.value) {

        const id = Number(editId.value);

        transactions = transactions.map(function(item) {

            if (item.id === id) {

                return {
                    ...item,
                    title,
                    amount,
                    type,
                    category,
                    date
                };

            }

            return item;

        });

    } else {

        const newTransaction = {

            id: Date.now(),

            title: title,

            amount: amount,

            type: type,

            category: category,

            date: date

        };

        transactions.push(newTransaction);

    }

    saveData();

    hideModal();

    renderApp();

});


// SAVE DATA IN LOCAL STORAGE

function saveData() {

    localStorage.setItem(
        "finoraTransactions",
        JSON.stringify(transactions)
    );

}


// CALCULATE FINANCIAL SUMMARY

function updateSummary() {

    let income = 0;
    let expense = 0;

    transactions.forEach(function(item) {

        if (item.type === "income") {

            income += item.amount;

        } else {

            expense += item.amount;

        }

    });

    const balance = income - expense;

    totalIncome.textContent = formatCurrency(income);

    totalExpense.textContent = formatCurrency(expense);

    totalBalance.textContent = formatCurrency(balance);

    totalTransactions.textContent = transactions.length;

}


// DISPLAY TRANSACTIONS

function displayTransactions() {

    const search = searchInput.value.toLowerCase();

    const selectedType = typeFilter.value;

    const selectedCategory = categoryFilter.value;

    const filteredTransactions = transactions.filter(function(item) {

        const matchesSearch =
            item.title.toLowerCase().includes(search) ||
            item.category.toLowerCase().includes(search);

        const matchesType =
            selectedType === "all" || item.type === selectedType;

        const matchesCategory =
            selectedCategory === "all" ||
            item.category === selectedCategory;

        return matchesSearch && matchesType && matchesCategory;

    });

    transactionList.innerHTML = "";

    if (filteredTransactions.length === 0) {

        transactionList.innerHTML = `
            <tr>
                <td colspan="6" class="empty-message">
                    No matching transactions found.
                </td>
            </tr>
        `;

        return;

    }

    const sortedTransactions = [...filteredTransactions].sort(
        (a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id
    );

    sortedTransactions.forEach(function(item) {

        const row = document.createElement("tr");

        const date = new Date(item.date + "T00:00:00")
            .toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });

        const amountClass =
            item.type === "income" ? "amount-income" : "amount-expense";

        const typeClass =
            item.type === "income" ? "type-income" : "type-expense";

        const sign =
            item.type === "income" ? "+" : "-";

        const nameCell = document.createElement("td");
        const name = document.createElement("span");

        name.className = "transaction-name";
        name.textContent = item.title;

        nameCell.appendChild(name);

        const categoryCell = document.createElement("td");
        const badge = document.createElement("span");

        badge.className = "category-badge";
        badge.textContent = item.category;

        categoryCell.appendChild(badge);

        const dateCell = document.createElement("td");
        dateCell.textContent = date;

        const typeCell = document.createElement("td");
        typeCell.className = typeClass;
        typeCell.textContent =
            item.type.charAt(0).toUpperCase() + item.type.slice(1);

        const amountCell = document.createElement("td");
        amountCell.className = amountClass;
        amountCell.textContent =
            sign + " " + formatCurrency(item.amount);

        const actionCell = document.createElement("td");

        const actions = document.createElement("div");
        actions.className = "action-buttons";

        const editButton = document.createElement("button");

        editButton.className = "edit-btn";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", function() {
            editTransaction(item.id);
        });

        const deleteButton = document.createElement("button");

        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {
            deleteTransaction(item.id);
        });

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        actionCell.appendChild(actions);

        row.appendChild(nameCell);
        row.appendChild(categoryCell);
        row.appendChild(dateCell);
        row.appendChild(typeCell);
        row.appendChild(amountCell);
        row.appendChild(actionCell);

        transactionList.appendChild(row);

    });

}


// EDIT TRANSACTION

function editTransaction(id) {

    const item = transactions.find(function(transaction) {

        return transaction.id === id;

    });

    if (!item) return;

    editId.value = item.id;

    transactionTitle.value = item.title;

    transactionAmount.value = item.amount;

    transactionType.value = item.type;

    transactionCategory.value = item.category;

    transactionDate.value = item.date;

    modalTitle.textContent = "Edit Transaction";

    saveButton.textContent = "Update Transaction";

    transactionModal.classList.add("show");

}


// DELETE TRANSACTION

function deleteTransaction(id) {

    const confirmation = confirm(
        "Are you sure you want to delete this transaction?"
    );

    if (!confirmation) return;

    transactions = transactions.filter(function(item) {

        return item.id !== id;

    });

    saveData();

    renderApp();

}


// CATEGORY-BASED EXPENSE ANALYSIS

function updateCategoryChart() {

    const chart = document.getElementById("categoryChart");

    const expenses = transactions.filter(function(item) {

        return item.type === "expense";

    });

    if (expenses.length === 0) {

        chart.innerHTML = `
            <div class="empty-chart">
                <div class="empty-chart-icon">◉</div>
                <p>No expense data yet</p>
                <small>Add expenses to see your spending pattern.</small>
            </div>
        `;

        return;

    }

    const categoryTotals = {};

    expenses.forEach(function(item) {

        categoryTotals[item.category] =
            (categoryTotals[item.category] || 0) + item.amount;

    });

    const colors = [
        "#168c83",
        "#e9a45b",
        "#8170c7",
        "#e46c6c",
        "#5689c7",
        "#a2b85d",
        "#cf82aa"
    ];

    const total = expenses.reduce(function(sum, item) {

        return sum + item.amount;

    }, 0);

    chart.innerHTML = "";

    Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .forEach(function(entry, index) {

            const category = entry[0];

            const amount = entry[1];

            const percentage = (amount / total) * 100;

            const row = document.createElement("div");

            row.className = "category-row";

            row.innerHTML = `
                <div class="category-info">
                    <span>${category}</span>
                    <span>${formatCurrency(amount)} (${percentage.toFixed(1)}%)</span>
                </div>

                <div class="category-track">
                    <div class="category-fill"
                    style="width:${percentage}%; background:${colors[index % colors.length]}">
                    </div>
                </div>
            `;

            chart.appendChild(row);

        });

}


// FINANCIAL INSIGHTS

function updateInsights() {

    const insightTitle = document.getElementById("insightTitle");

    const insightText = document.getElementById("insightText");

    let income = 0;
    let expense = 0;

    transactions.forEach(function(item) {

        if (item.type === "income") {

            income += item.amount;

        } else {

            expense += item.amount;

        }

    });

    if (transactions.length === 0) {

        insightTitle.textContent = "Start Your Financial Journey";

        insightText.textContent =
            "Add your income and expenses to discover useful insights about your financial habits.";

    } else if (income === 0 && expense > 0) {

        insightTitle.textContent = "Track Your Spending";

        insightText.textContent =
            "You have recorded expenses but no income yet. Add your income to understand your complete financial position.";

    } else if (expense === 0 && income > 0) {

        insightTitle.textContent = "Great Start!";

        insightText.textContent =
            "You have recorded income without any expenses. Keep tracking your spending to understand your financial habits.";

    } else if (expense > income) {

        insightTitle.textContent = "Watch Your Spending!";

        insightText.textContent =
            "Your expenses are higher than your recorded income. Consider reviewing your spending categories.";

    } else {

        const savings = income - expense;

        const savingsRate = (savings / income) * 100;

        insightTitle.textContent = "Your Savings Rate: " +
            savingsRate.toFixed(1) + "%";

        insightText.textContent =
            "You have retained " + formatCurrency(savings) +
            " from your recorded income. Keep maintaining a healthy balance.";

    }

}


// SEARCH AND FILTER EVENTS

searchInput.addEventListener("input", displayTransactions);

typeFilter.addEventListener("change", displayTransactions);

categoryFilter.addEventListener("change", displayTransactions);


// UPDATE EVERYTHING

function renderApp() {

    updateSummary();

    displayTransactions();

    updateCategoryChart();

    updateInsights();

}


// INITIALIZE APPLICATION

renderApp();