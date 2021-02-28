const router = require("express").Router();
const Transaction = require("../models/transaction.js");
const path = require("path");

// Test
router.get("/test", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../__test", "index.html"));
});

// Restful API
router.post("/api/transaction", ({ body }, res) => {
    Transaction.create(body)
        .then(dbTransaction => {
            res.json(dbTransaction);
        })
        .catch(err => {
            res.status(404).json(err);
        });
});

router.post("/api/transaction/bulk", ({ body }, res) => {
    Transaction.insertMany(body)
        .then(dbTransaction => {
            res.json(dbTransaction);
        })
        .catch(err => {
            res.status(404).json(err);
        });
});

router.get("/api/transaction", (req, res) => {
    Transaction.find({}).sort({ date: -1 })
        .then(dbTransaction => {
            res.json(dbTransaction);
        })
        .catch(err => {
            res.status(404).json(err);
        });
});

module.exports = router;