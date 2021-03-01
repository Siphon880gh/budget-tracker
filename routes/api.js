const router = require("express").Router();
const Transaction = require("../models/transaction.js");
const path = require("path");

// Test
router.get("/test", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../__test", "index.html"));
});

// Restful API

/**
 * @route       POST /api/transaction   Create transaction record to database
 * @bodyParam   name {string}           Name of transaction
 * @bodyParam   value {signed float}    Fund added or subtracted (negative)
 * @bodyParam   date {Date}             Date and time of transaction
 * 
 */
router.post("/api/transaction", ({ body }, res) => {
    Transaction.create(body)
        .then(dbTransaction => {
            res.json(dbTransaction);
        })
        .catch(err => {
            res.status(404).json(err);
        });
});

/**
 * @route       POST /api/transaction/bulk   Create multiple transaction records to database
 * @bodyParam   - Array<Objects>            Each object has name, value, date key-value pairs (refer to POST/api/transaction)
 * 
 */
router.post("/api/transaction/bulk", ({ body }, res) => {
    Transaction.insertMany(body)
        .then(dbTransaction => {
            res.json(dbTransaction);
        })
        .catch(err => {
            res.status(404).json(err);
        });
});

/**
 * @route       GET /api/transaction   Get all transaction records from database
 * @return      - Array<Objects>       Each object has name, value, date key-value pairs (refer to POST/api/transaction)
 * 
 */
router.get("/api/transaction", (req, res) => {
    Transaction.find({}).sort({ date: -1 }).select("-__v")
        .then(dbTransaction => {
            res.json(dbTransaction);
        })
        .catch(err => {
            res.status(404).json(err);
        });
});

/**
 * @route       DELETE /api/transaction   Clear all transaction records from database
 * 
 */
router.delete("/api/transaction", (req, res) => {
    Transaction.deleteMany({})
        .then(dbTransaction => {
            res.json({ message: "Deleted all transactions" });
        })
        .catch(err => {
            res.status(404).json(err);
        });
});

module.exports = router;