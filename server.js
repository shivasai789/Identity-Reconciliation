require("dotenv").config()
const express = require("express")
const createContactTable = require("./models/Contact")
const contactRouter = require("./routes/contact")

const app = express();
const port = process.env.PORT || 3000

app.use(express.json())

createContactTable();

app.use('/api', contactRouter)

app.get("/", (req, res) => {
    res.send("Hello from backend!")
})

app.listen(port, () => {
    console.log("server running on port no. 3000")
})