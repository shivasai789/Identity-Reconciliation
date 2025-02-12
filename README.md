# Bitespeed Contact Identity Service

## Overview
Bitespeed requires a system to track and consolidate customer identities across multiple purchases. Orders on **FluxKart.com** always contain either an **email** or a **phoneNumber**. The service maintains contact information in a relational database and links contacts based on shared identifiers.

## Database Schema

The `Contact` table is structured as follows:

```json
{
  "id": Int,
  "phoneNumber": String?,
  "email": String?,
  "linkedId": Int?, // Links to the primary contact if secondary
  "linkPrecedence": "primary" | "secondary", // Oldest contact is primary
  "createdAt": DateTime,
  "updatedAt": DateTime,
  "deletedAt": DateTime?
}
```

-   If a **contact is new**, a primary entry is created.
-   If a **contact matches an existing one** (by email or phoneNumber), a secondary entry is created and linked to the primary contact.
-   If two existing **primary contacts** are found to be linked, the older one remains primary, and the newer one is converted to secondary.

## API Endpoint
### Identify Contact
#### Endpoint:

`POST api/identity`

#### Request Body:
```json
{
    "email": "lorraine@hillvalley.edu",
    "phoneNumber": "123456"
}
```

#### Response Body:
```json
{
    "contact": {
        "emails": [
            "lorraine@hillvalley.edu",
            "marty@hillvalley.edu"
        ],
        "phoneNumbers": [
            "123456"
        ],
        "secondaryContactIds": [
            3
        ]
    }
}
```
###
### Business Logic

#### 1. New Contact Creation:
If no existing contacts match the given `email` or `phoneNumber`, a new **primary** contact is created.

#### Request Body:
```json
{
    "email": "sadfasdfdf@gmail.com",
    "phoneNumber": "000000"
}
```

#### Response Body:
```json
{
    "message": "Primary contact created!",
    "contact": {
        "primaryContactId": 12,
        "emails": [
            "sadfasdfdf@gmail.com"
        ],
        "phoneNumbers": [
            "000000"
        ],
        "secondaryContactIds": []
    }
}
```
###
#### 2. Creating Secondary Contacts:
If a contact with the given `email` or `phoneNumber` already exists but contains new information, a **secondary** contact is created.

#### Request Body:
```json
{
    "email": "shivasai@gmail.com",
    "phoneNumber": "000000"
}
```

#### Response Body:
```json
{
    "contact": {
        "primaryContactId": 12,
        "emails": [
            "sadfasdfdf@gmail.com",
            "shivasai@gmail.com"
        ],
        "phoneNumbers": [
            "000000"
        ],
        "secondaryContactIds": [
            13
        ]
    }
}
```
###
#### 3. Primary Contact Merging:
If two primary contacts are linked by a new request, the older primary contact remains primary, and the newer one is converted to secondary.

#### Request Body:
```json
{
    "email": "sdkfjlksdfjlk@gmail.com",
    "phoneNumber": "654321"
}
```

#### Response Body:
```json
{
    "contact": {
        "primaryContactId": 8,
        "emails": [
            "sdkfjlksdfjlk@gmail.com",
            "sjkdhsdjk@gmail.com"
        ],
        "phoneNumbers": [
            "123456",
            "654321"
        ],
        "secondaryContactIds": [
            9
        ]
    }
}
```
