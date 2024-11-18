let transactions = [];
let myChart;

fetch("/app/budget-tracker/api/transaction")
    .then(response => {
        return response.json();
    })
    .then(data => {
        // save db data on global variable
        transactions = data;

        populateTotal();
        populateTable();
        populateChart();
    });

function clearForm() {

    let nameEl = document.querySelector("#t-name");
    let amountEl = document.querySelector("#t-amount");

    // Clear form
    nameEl.value = "";
    amountEl.value = "";
}

function populateTotal() {
    // reduce transaction amounts to a single total value
    let total = transactions.reduce((total, t) => {
        return total + parseInt(t.value);
    }, 0);

    let totalEl = document.querySelector("#total");
    totalEl.textContent = total;
}

function populateTable() {
    let tbody = document.querySelector("#tbody");
    tbody.innerHTML = "";

    transactions.forEach(transaction => {
        // create and populate a table row
        let tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${transaction.name}</td>
      <td>${transaction.value}</td>
    `;

        tbody.appendChild(tr);
    });
}

function populateChart() {
    // copy array and reverse it
    let reversed = transactions.slice().reverse();
    let sum = 0;

    // create date labels for chart
    let labels = reversed.map(t => {
        let date = new Date(t.date);
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    });

    // create incremental values for chart
    let data = reversed.map(t => {
        sum += parseInt(t.value);
        return sum;
    });

    // remove old chart if it exists
    if (myChart) {
        myChart.destroy();
    }

    let ctx = document.getElementById("myChart").getContext("2d");

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: "Total Over Time",
                fill: true,
                backgroundColor: "#6666ff",
                data
            }]
        }
    });
}

function sendTransaction(isAdding) {
    let nameEl = document.querySelector("#t-name");
    let amountEl = document.querySelector("#t-amount");
    let errorEl = document.querySelector(".form .error");

    // validate form
    if (nameEl.value === "" || amountEl.value === "") {
        errorEl.textContent = "Missing Information";
        return;
    } else {
        errorEl.textContent = "";
    }

    // create record
    let transaction = {
        name: nameEl.value,
        value: Math.abs(parseInt(amountEl.value)),
        date: new Date().toISOString()
    };

    // if subtracting funds, convert amount to negative number
    if (!isAdding) {
        transaction.value *= -1;
    }

    // add to beginning of current array of data
    transactions.unshift(transaction);

    // re-run logic to populate ui with new record
    populateChart();
    populateTable();
    populateTotal();

    // also send to server
    fetch("/app/budget-tracker/api/transaction", {
            method: "POST",
            body: JSON.stringify(transaction),
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            if (data.errors) {
                errorEl.textContent = "Missing Information";
            } else {
                clearForm();
            }
        })
        .catch(err => {
            // fetch failed, so save in indexed db
            temp_add(transaction);
            clearForm();

            console.log({ message: "User is offline. Will update transactions to server database once user is online.", transaction })
        });
} // sendTransaction

// User clicks add fund button
document.querySelector("#add-btn").onclick = function() {
    sendTransaction(true);
};

// User clicks subtract fund button
document.querySelector("#sub-btn").onclick = function() {
    sendTransaction(false);
};


// Option to reset database to blank

function resetDatabase() {
    purgeAllAtClient(); // You are clearing the database, so any offline transactions before get dropped

    fetch("/app/budget-tracker/api/transaction", {
            method: "DELETE"
        })
        .then(response => {
            return response.json();
        })
        .catch(err => {
            console.log({ message: "User is offline. Will wipe server database if back online in this session. This means any transactions made offline will be cleared too. Leave webpage to cancel wiping database." });
            window.addEventListener('online', () => {
                document.querySelector("#tbody").innerHTML = "";

                resetDatabase();
                location.reload(); // so doesn't keep resetting database if you disconnect more than once
            });
        });
} // resetDatabase

document.querySelector("#reset-btn").onclick = function() {
    if (confirm("Are you sure you want to wipe the database?")) {
        resetDatabase();

        // Empty transactions table

        document.querySelector("#tbody").innerHTML = "";
        clearForm();
        location.reload(); // forces graph to clear, also forces old entries to flush from cache so they don't reappear if you add a new transaction
    }
};