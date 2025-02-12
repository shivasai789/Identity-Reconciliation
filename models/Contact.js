const db = require("../config/db")

const createContactTable = async () => {
    const contactTableSchema = `
        CREATE TABLE IF NOT EXISTS contact(
        id SERIAL PRIMARY KEY,
        phoneNumber VARCHAR(20),
        email VARCHAR(40),
        linkedId INT,
        linkPrecedence VARCHAR(10) CHECK (linkPrecedence IN ('primary', 'secondary')),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deletedAt TIMESTAMP NULL
        )
    `;

    try {
        db.query(contactTableSchema);
    }
    catch (error) {
        console.log("Error while creating the table: ", error)
    }
}

module.exports = createContactTable;