const express = require("express")
const contactController = require("../controllers/contact")

const router = express.Router();

router.post('/identity', contactController)

module.exports = router