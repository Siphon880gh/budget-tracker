/** 
 * @file idb.js Offline persistance of database records
 * 
 */


// When offline, temporarily create persistent records on client's IndexedDB

/**
 * 
 * @function temp_init
 * Must run to init the IndexedDB on client's side so that when internet is down,
 * fetch requests are caught and the information stores to client's IndexedDB instead.
 * 
 */
(function temp_init() {
    // Establish a connection to IndexedDB database called 'budget'

    const request = indexedDB.open('budget');

    // Upon a successful 
    request.onsuccess = function(event) {

        // When db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
        window.db = event.target.result;

    };

    // this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
    request.onupgradeneeded = function(event) {
        // save a reference to the database 
        window.db = event.target.result;
        // create an object store (table) called `new_pizza`, set it to have an auto incrementing primary key of sorts 
        db.createObjectStore('transactions', {
            autoIncrement: true
        });
    };

})();

/**
 * 
 * @function temp_add
 * @param newRecord {object} Object with name, value, date from transaction that's
 *                           supposed to be post to the server's database but the client is
 *                           offline, so store to the temporary client's IndexedDb instead
 * 
 */
function temp_add(newRecord) {
    // Open a new transaction with the database with read and write permissions 
    // First param: names of object stores that are in the scope of the new transaction (array of strings) or only one object store in the scope of the new transaction (string):
    const transaction = db.transaction(['transactions'], 'readwrite');

    // Access the object store for `new_pizza`
    const objectStore = transaction.objectStore('transactions');

    // Add record to your store with add method
    objectStore.add(newRecord);

    // To see if it runs
    debugger;
} // add

/**
 * 
 * @function temp_purge
 * User is back online. Move all IndexedDB records to the server's database. Then purge the IndexedDB records.
 */
async function temp_purge() {
    // Open a transaction on your db
    const transaction = db.transaction(['transactions'], 'readwrite');

    // Access your object store
    const objectStore = transaction.objectStore('transactions');

    // Get all records from store
    const getAll = objectStore.getAll();

    getAll.onsuccess = function() {
        const manyRecords = getAll.result;

        const purgeAllAtClient = () => {
            // Access object store with read and write permissions
            const transaction = db.transaction(['transactions'], 'readwrite');

            // Access the new_pizza object store
            const objectStore = transaction.objectStore('transactions');

            // Clear all items in your store
            objectStore.clear();

            // To see if it runs
            debugger;
        }

        // Insert IndexedDB records to server's database, then purge IndexedDB
        (function insertManyToServer(thenCallback) {

            if (manyRecords.length === 0) return;
            console.log({ message: "Offline transactions found. Will move to server database now.", records: manyRecords })

            fetch("/api/transaction/bulk", {
                    method: "POST",
                    body: JSON.stringify(manyRecords),
                    headers: {
                        Accept: "application/json, text/plain, */*",
                        "Content-Type": "application/json"
                    }
                })
                .then(response => {
                    thenCallback();

                    return JSON.stringify({ message: "Temp records purged from IndexedDB and pushed to server database", response: response.json() });
                });
        })(purgeAllAtClient);

    };

} // temp_purge


// When back online, push the temporary records to the server's database and clear temporary records on IndexedDb
window.addEventListener('online', () => {
    temp_purge();
});