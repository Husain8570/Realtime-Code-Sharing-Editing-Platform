const express = require("express");
const router = express.Router();
const runCode = require("../controllers/runController");


router.post("/run", runCode); // No auth middleware here

module.exports = router;
