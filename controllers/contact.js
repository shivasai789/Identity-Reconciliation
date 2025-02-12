const db = require("../config/db");

const contactController = async (req, res) => {
    try {
        const { email, phoneNumber } = req.body;

        //validating email
        if (!email && !phoneNumber) {
            return res.status(400).json({
                message: "any one of the field should contain value!"
            });
        }

        const queryTextForEmailAndPhn = `SELECT * FROM contact WHERE email LIKE $1 OR phonenumber LIKE $2`;
        const queryTextForEmail = `SELECT * FROM contact WHERE email LIKE $1`
        const queryTextForPhn = `SELECT * FROM contact WHERE phonenumber LIKE $1`

        let response;

        if (phoneNumber !== null && email !== null) {
            response = await db.query(queryTextForEmailAndPhn, [email, phoneNumber])
        }
        else if (phoneNumber !== null && email === null) {
            response = await db.query(queryTextForPhn, [phoneNumber])
        }
        else {
            response = await db.query(queryTextForEmail, [email])
        }

        const totalUsers = response.rows;

        // console.log(totalUsers)

        if (totalUsers.length === 0) {

            const createNewItemQuery = `
                insert into contact(phonenumber,email,linkedId,linkprecedence,createdat,updatedat,deletedat)
                values ($1,$2,$3,$4,$5,$6,$7)
                `
            await db.query(createNewItemQuery, [phoneNumber, email, null, "primary", new Date(), new Date(), null])

            const response = await db.query(queryTextForEmailAndPhn, [email, phoneNumber])

            const totalUsers = response.rows;

            const primaryContactId = totalUsers[0].id
            const emails = [totalUsers[0].email];
            const phoneNumbers = [totalUsers[0].phonenumber];
            const secondaryContactIds = []

            return res.status(200).json({
                message: "Primary contact created!",
                contact: {
                    primaryContactId,
                    emails,
                    phoneNumbers,
                    secondaryContactIds
                }
            })

        }
        else if (totalUsers.length === 1) {

            const primaryContact = totalUsers[0];

            const isNewInfo = (phoneNumber && phoneNumber !== primaryContact.phonenumber) || (email && email !== primaryContact.email);

            if (isNewInfo) {

                const createNewItemQuery = `
                insert into contact(phonenumber,email,linkedId,linkprecedence,createdat,updatedat,deletedat)
                values ($1,$2,$3,$4,$5,$6,$7)
                `
                await db.query(createNewItemQuery, [phoneNumber, email, totalUsers[0].id, "secondary", new Date(), new Date(), null])

                const response = await db.query(queryTextForEmailAndPhn, [email, phoneNumber]);
                const updatedUsers = response.rows;

                const mainPrimary = updatedUsers[0];

                const primaryContactId = mainPrimary.id;
                let emails = new Set();
                let phoneNumbers = new Set();
                let secondaryContactIds = [];

                updatedUsers.forEach(eachItem => {
                    if (eachItem.email) emails.add(eachItem.email);
                    if (eachItem.phonenumber) phoneNumbers.add(eachItem.phonenumber);
                    if (eachItem.linkprecedence === "secondary") secondaryContactIds.push(eachItem.id);
                });

                return res.status(200).json({
                    message: "Secondary contact created!",
                    contact: {
                        primaryContactId,
                        emails: [...emails],
                        phoneNumbers: [...phoneNumbers],
                        secondaryContactIds
                    }
                });

            }
            else {

                const primaryContactId = totalUsers[0].id
                const emails = [totalUsers[0].email];
                const phoneNumbers = [totalUsers[0].phonenumber];
                const secondaryContactIds = []

                return res.status(200).json({
                    contact: {
                        primaryContactId,
                        emails,
                        phoneNumbers,
                        secondaryContactIds
                    }
                })

            }

        }
        else {
            const primaryItems = totalUsers.filter(eachItem => eachItem.linkprecedence === "primary");

            if (primaryItems.length === 1) {
                const primaryContactId = primaryItems[0].id;

                let emails = new Set();
                let phoneNumbers = new Set();
                let secondaryContactIds = [];

                totalUsers.forEach(eachItem => {
                    if (eachItem.email) emails.add(eachItem.email);
                    if (eachItem.phonenumber) phoneNumbers.add(eachItem.phonenumber);
                    if (eachItem.linkprecedence === "secondary") secondaryContactIds.push(eachItem.id);
                });

                return res.status(200).json({
                    contact: {
                        primaryContactId,
                        emails: [...emails],
                        phoneNumbers: [...phoneNumbers],
                        secondaryContactIds
                    }
                });
            }
            else {

                const mainPrimary = primaryItems[0];
                const secondaryToUpdate = primaryItems.slice(1);

                for (let sec of secondaryToUpdate) {
                    const query = `UPDATE contact SET linkprecedence = 'secondary', linkedid = $1 WHERE id = $2`;
                    await db.query(query, [mainPrimary.id, sec.id]);
                }

                const response = await db.query(queryTextForEmailAndPhn, [email, phoneNumber]);
                const updatedUsers = response.rows;

                const primaryContactId = mainPrimary.id;
                let emails = new Set();
                let phoneNumbers = new Set();
                let secondaryContactIds = [];

                updatedUsers.forEach(eachItem => {
                    if (eachItem.email) emails.add(eachItem.email);
                    if (eachItem.phonenumber) phoneNumbers.add(eachItem.phonenumber);
                    if (eachItem.linkprecedence === "secondary") secondaryContactIds.push(eachItem.id);
                });

                return res.status(200).json({
                    contact: {
                        primaryContactId,
                        emails: [...emails],
                        phoneNumbers: [...phoneNumbers],
                        secondaryContactIds
                    }
                });
            }
        }


    } catch (error) {
        console.error("Error in contact:", error.message);
        res.status(500).json({
            message: "Failed to fetch data",
        });
    }
};

module.exports = contactController;
