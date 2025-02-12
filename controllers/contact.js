const db = require("../config/db");

const contactController = async (req, res) => {
    try {
        const { email, phoneNumber } = req.body;

        //validating email
        if (!email || typeof email !== "string") {
            return res.status(400).json({
                message: "invalid email!"
            });
        }

        //validating phone number
        if (!phoneNumber || typeof phoneNumber !== "string") {
            return res.status(400).json({
                message: "invalid phone number!"
            });
        }

        const queryTextForEmailAndPhn = `SELECT * FROM contact WHERE email LIKE $1 OR phonenumber LIKE $2`;

        const response = await db.query(queryTextForEmailAndPhn, [email, phoneNumber])
        const totalUsers = response.rows;

        if (totalUsers.length === 0) {

            const createNewItemQuery = `
                insert into contact(phonenumber,email,linkedId,linkprecedence,createdat,updatedat,deletedat)
                values ($1,$2,$3,$4,$5,$6,$7)
                `
            await db.query(createNewItemQuery, [phoneNumber, email, null, "primary", new Date(), new Date(), null])

            return res.status(200).json({
                message: "primary contact successfully created"
            });
        }
        else if (totalUsers.length === 1) {

            const createNewItemQuery = `
            insert into contact(phonenumber,email,linkedId,linkprecedence,createdat,updatedat,deletedat)
            values ($1,$2,$3,$4,$5,$6,$7)
            `
            await db.query(createNewItemQuery, [phoneNumber, email, totalUsers[0].id, "secondary", new Date(), new Date(), null])

            return res.status(200).json({
                message: "secondary contact successfully created"
            })
        }
        else {

            const primaryItems = totalUsers.filter(eachItem => eachItem.linkprecedence === "primary")

            if (primaryItems.length === 1) {

                const primaryContatctId = primaryItems.id;
                let emails = [];
                let phoneNumbers = [];
                let secondaryContactIds = [];

                totalUsers.forEach(eachItem => {
                    if (emails.length === 0 || emails[emails.length - 1] !== eachItem.email) emails.push(eachItem.email);
                    if (phoneNumbers.length === 0 || phoneNumbers[phoneNumbers.length - 1] !== eachItem.phonenumber) phoneNumbers.push(eachItem.phonenumber)
                    if (eachItem.linkprecedence === "secondary") secondaryContactIds.push(eachItem.id);
                })

                return res.status(200).json({
                    contact: {
                        primaryContatctId,
                        emails,
                        phoneNumbers,
                        secondaryContactIds
                    }
                })
            }
            else {

                const query = `update contact set linkprecedence = 'secondary',linkedid = $1 where id = $2`;
                await db.query(query, [primaryItems[0].id, primaryItems[1].id]);

                const response = await db.query(queryTextForEmailAndPhn, [email, phoneNumber])
                const totalUsers = response.rows;

                const primaryContatctId = primaryItems[0].id;
                let emails = [];
                let phoneNumbers = [];
                let secondaryContactIds = [];

                totalUsers.forEach(eachItem => {
                    if (emails.length === 0 || emails[emails.length - 1] !== eachItem.email) emails.push(eachItem.email);
                    if (phoneNumbers.length === 0 || phoneNumbers[phoneNumbers.length - 1] !== eachItem.phonenumber) phoneNumbers.push(eachItem.phonenumber)
                    if (eachItem.linkprecedence === "secondary") secondaryContactIds.push(eachItem.id);
                })

                return res.status(200).json({
                    contact: {
                        primaryContatctId,
                        emails,
                        phoneNumbers,
                        secondaryContactIds
                    }
                })

            }
        }

        return res.status(200).json({
            totalUsers
        })

    } catch (error) {
        console.error("Error in contact:", error.message);
        res.status(500).json({
            message: "Failed to fetch data",
        });
    }
};

module.exports = contactController;
