# Api Diwe

This api is made by NodeJs and Mongo DB

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/ed275fb8490446f8a085a0d5a6481a2e)](https://app.codacy.com/gh/PaulDelamare/Diwe_back/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

## Explanation

This project was carried out for a school project focused on the theme of diabetes. The aim of the application is therefore to provide help to diabetics in their data control and better simplicity in contact with their healthcare professionals.
This is therefore the API part which manages all the major functionality linked to the database. This api was released in node js using express.
We used a structure using a Controller, a route and a model to process the data. The major functions used are found in the "utils" folder, and emails in the "email" folder.
The API configuration, particularly for the jwt token or the email, is located in the “config” folder. And finally, the cron tasks allowing the execution of the code at a given time are located in "task"

## Installation

1. Clone the repository
2. Run `npm install`
3. Create a database
4. Copy the `.env.example` file to `.env`
5. Create these folders at the root :
* uploads
    * orders
    * pdfs
    * attachments
    * prescriptions
    * public
        * dailyPopup
        * meals
        * profilePicture

## Usage

Run `node index`

## Header

- Don't forget to add the api key in x-api-key for all routes

## Authentication

- The jwt token can be requested for authentication and the role can be verified

> if an error occurs :

- 401/403/500

```json
{
    "error": string,
    "status": number
}
```

> If the check is completed correctly, returns nothing but performs the request

### Register

`POST auth/register`

Authentication :

> No authentication

Parameters :

> No parameters

Body:

| Name       | Type   | Description                                     |
| --------   | ------ | ----------------------------------------------- |
| email      | string | The email of the user, unique email             |
| firstname  | string | The firstname of the user                       |
| password   | string | The password of the user                        |
| role       | string | The role of the user ['user', 'health', 'blog'] |
| birthday   | Date   | The birthdate of the user                       |
| secret_pin | number | The secret pin of the user                      |
| lastname   | string | The lastname of the user (optionnal)            |
| phone      | string | The phone number of the user (optionnal)        |

Response :

> An email is send to the user

-   201

```json
{
    "status": number,
    "message" : string
}
```

- 422/500

```json
{
    "error": string,
    "status": number
}
```

> The message depends on the error 

### Login

`POST auth/login`

Authentication :

> No authentication

Parameters:

> No parameters

Body :

| Name     | Type   | Description       |
| -------- | ------ | ----------------- |
| email    | string | The user email    |
| password | string | The user password |

Response :

> An email is send to user

- 200

```json
{
    "message": string,
    "status":  number
}
```
```json
{
    "access_token": string,
    "user" : {
        "fistname": string,
        "lastname": string,
        "email": string,
        "role": string,
        "phone": string
    },
    "status":  number
}
```

- 401/422/500

```json
{
  "error": string,
  "status": number,
  "redirection"?: boolean
}
```

> The message and the status depends on the error

### Verify Code

`POST auth/two-factor`

Authentication :

> No authentication

Parameters:

> No parameters

Body :

| Name  | Type   | Description            |
| ----- | ------ | ---------------------- |
| email | string | The user email         |
| code  | number | The code send by email |

Response :

> An email is send to user

- 200

```json
{
    "access_token": string,
    "user" : {
        "fistname": string,
        "lastname": string,
        "email": string,
        "role": string,
        "phone": string,
        "profile_picture": string,
        "secret_pin": number,
        "last_meal": {
            "image_path": string,
            "name": string,
            "calories": number,
            "proteins": number,
            "lipids": number,
            "glucids": number,
            "fibers": 7number,
            "calcium": number,
            "created_at": Date
        }
    },
    "status":  number
}
```

- 400/422/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status depends on the error

### Resend Login Code

`POST auth/resend-code`

Authentication :

> No authentication

Parameters:

> No parameters

Body :

| Name  | Type   | Description            |
| ----- | ------ | ---------------------- |
| email | string | The user email         |

Response :

> An email is send to user

- 200

```json
{
    "message": string,
    "status":  number
}
```

- 400/422/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status depends on the error

### Resend Validation Email

`POST auth/resend`

Authentication :

> No authentication

Parameters:

> No parameters

Body :

| Name     | Type   | Description              |
| -------- | ------ | ------------------------ |
| email    | string | The email of the user    |

Response :

> An email is send to the user

- 200

```json
{
    "message" : string,
    "status":  number
}
```

- 404/409/422/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status depends on the error

### Validate account

`GET validateAccount?email={email}&token={token}`

- This route is use only in email for validate account and don't require api-key

Authentication :

> No authentication

Parameters:

- Account Email
- Account Token

Body :

> No body

Response :

> An email is send to the user

- Success - Redirection

> An email is send for confirm validation

- Error - redirection

> An email is sent to inform of the error during account validation

## User

### Update user password

`PUT user/update-password`

Authentication :

> Jwt token require

Parameters :

> No parameters

Body :

| Name        | Type   | Description           |
| ----------- | ------ | --------------------- |
| password    | string | The user password     |
| newPassword | string | The new user password |

Response :

> An email is send to the user

- 200 

```json
{
    "message": string,
    "status": number
}
```

- 401/404/422/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

### Update user email

`PUT user/update-email`

Authentication :

> Jwt token require

Parameters :

> No parameters

Body :

| Name     | Type   | Description           |
| -------- | ------ | --------------------- |
| password | string | The user password     |
| newEmail | string | The new user email    |
| oldEmail | string | The old user email    |

Response :

> An email is send to the new email for validate change

- 200 

```json
{
    "message": string,
    "status": number,
}
```

- 401/404/422/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

### Update user email

`GET verify-email-change`

Authentication :

> Jwt token require

Parameters :

> The token pass in link with ?token=

Body :

> No body

Response :

- Success - Redirection

> The succes of this operation **need the reconnection og the user**

- Error - Redirection

### Check last user connection

`GET user/last-connection`

Authentication :

> Jwt token require

Parameters :

> No parameters

Body :

> No body

Response : 

- 200

> First connection of the day

```json
{
    "popup": {
        "image_path": string,
        "text": string,
    },
    "status": number
}
```

- 200

> There has already been a connection during the day

```json
{
    "message": string,
    "status": number
}
```

- 404/500

```json
{
    "error": string,
    "status": number
}
```

> The message and the status error depends on the error

### Update profile picture

`POST user/update-profile-picture`

Authentication :

> Jwt token require

Parameters :

> No parameters

Body :

- Data must be sent as FormData.

| Name  | Type | Description             |
| ----- | ---- | ----------------------- |
| image | file | The new profile picture |

Response :

- 200 

```json
{
    "message": string,
    "image": string,
    "status": number
}
```

- 404/422/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

### Update information

`PUT user/update-information`

Authentication :

> Jwt token require

Parameters :

> No parameters

Body :

| Name      | Type   | Description                       |
| --------- | ------ | --------------------------------- |
| firstname | string | The user firstname                |
| lastname  | string | The user lastname                 |
| birthdate | Date   | The user birthdate                |
| phone     | string | The user phone number (optionnal) |

Response :

- 200 

```json
{
    "message": string,
    "status": number,
    "user" : {
        "fistname": string,
        "lastname": string,
        "birthdate": string,
        "phone": string
    },
}
```

- 404/422/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

### Request deletion

`PUT user/request-deletion`

> This request is used to request deletion or cancel the request, if there is already a date to enter in the deletion request, in this case reusing this request will cancel the previous request

Authentication :

> Jwt token require

Parameters :

> No parameters

Body :

> No body

Response :

> An email is send

- 200 

```json
{
    "message": string,
    "status": number,
}
```

- 404/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

### Find doctor

`GET user/find-doctor?email={email}`

Authentication :

> Jwt token require

Parameters :

> Pass as parameter the email

Body :

> No body

Response :

- 200

```json
{
    "doctor": {
        "_id": string,
        "firstname": string,
        "lastname": string,
        "email": string,
        "phone": string
    },
    "status": number,
}
```

- 404/422/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

### Request link to doctor

`POST user/request-link?id={id}`

Authentication :

> Jwt token require

Parameters :

> Pass in parameters the id_doctor to link

Body :

> No body

Response :

> An email is send to the doctor or if it's a fictive doctor automatically bind

- 200/201

```json
{
    "message": string,
    "status": number,
}
```

- 401/404/409/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

### Request get request link to doctor

`GET user/request`

Authentication :

> Jwt token require

Parameters :

> No parameters

Body :

> No body

Response :

- 200

```json
{
    "requests": [
        {
            "status": string,
            "created_at": Date,
            "doctor": [
                {
                    "fistname": string,
                    "lastname": string,
                    "email": string,
                    "phone": string,
                }
            ]
        }
    ],
    "status": number,
}
```

- 404/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

### Get doctor linked

`GET user/doctor`

Authentication :

> Jwt token require

Parameters :

> No parameters

Body :

> No body

Response :

- 200

```json
{
    "doctors": [
        {
            "_id": string,
            "id_user": string,
            "firstname": string,
            "lastname": string,
            "email": string,
            "phone": string
        }
    ],
    "status": number,
}
```

- 404/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

### Create fictive doctor

`POST user/doctor`

Authentication :

> Jwt token require

Parameters :

> No parameters

Body :

| Name      | Type   | Description                     |
| --------- | ------ | ------------------------------- |
| email     | string | The doctor email                |
| firstname | string | The doctor firstname            |
| lastname  | string | The doctor lastname (optionnal) |
| phone     | string | The doctor lastname (optionnal) |

Response :

> Send email to the doctor email

- 201

```json
{
    "message": string,
    "status": number,
}
```

- 404/409/422/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

### Update the Prescription

`PUT user/prescription`

Authentication :

> Jwt token require

Parameters :

> No parameters

Body :

| Name         | Type       | Description                    |
| ------------ | ---------- | ------------------------------ |
| prescription | file (pdf) | The prescription in pdf format |

Response :

> An email is send to the user

- 200

```json
{
    "message": string,
    "status": number,
}
```

- 401/404/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

### Get the Prescription

`GET user/prescription`

Authentication :

> Jwt token require

Parameters :

> No parameters

Body :

> No body

Response :

- 200

> Type de contenu : application/pdf

- 404/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

### Delete Link

`PUT user/delete-link?id_delete={id_delete}`

Authentication :

> Jwt token require

Parameters :

> Forward request for user or doctor id to be removed in link

Body :

> No body

Response :

> Send an email to the user who has just had links removed

- 200

> Type de contenu : application/pdf

- 400/404/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

## Doctor

### Get Request

`GET doctor/request`

Authentication :

> Jwt token require

Parameters :

> No parameters

Body :

> No body

Response :

- 200

```json
{
    "requests": [
        {
            "status": string,
            "created_at": Date,
            "users": [
                {
                    "fistname": string,
                    "lastname": string,
                    "email": string,
                    "phone": string,
                }
            ]
        }
    ],
    "status": number,
}
```

- 404/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

### Validate Request

`POST doctor/validate-request?id={id}`

Authentication :

> Jwt token require

Parameters :

> Pass as parameter the id of the request to accept

Body :

| Name     | Type    | Description                                                 |
| -------- | ------- | ----------------------------------------------------------- |
| validate | boolean | The response request (true for accept and false for refuse) |

Response :

> An email is send to the user

- 200

```json
{
    "message": string,
    "status": number,
}
```

- 401/404/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

### Get users linked

`GET doctor/users`

Authentication :

> Jwt token require

Parameters :

> No parameters

Body :

> No body

Response :

- 200

```json
{
    "users": [
        {
            "_id": string,
            "firstname": string,
            "lastname": string,
            "email": string,
            "phone": string
        }
    ],
    "status": number,
}
```

- 404/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

### Get One User Information

`GET doctor/user-detail?if={id_user}`

Authentication :

> Jwt token require

Parameters :

> Pass in the url the id_user to consult

Body :

> No body

Response :

- 200

```json
{
    "user": [
        {
            "_id": string,
            "firstname": string,
            "lastname": string,
            "email": string,
            "phone": string,
            "birthday": Date
        }
    ],
    "lastMeal":{
        "_id": string,
        "id_user": string,
        "image_path": string,
        "name": string,
        "calories": number,
        "proteins": number,
        "lipids": number,
        "glucids": number,
        "fibers": number,
        "calcium": number,
        "created_at": Date,
        "__v": number
    },
    "status": number,
}
```

- 400/403/404/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

## Meal

### Add meal 

`POST meal`

Authentication :

> Jwt token require and only user role can use it

Parameters :

> No parameters

Body :

- Data must be sent as FormData

| Name     | Type   | Description       |
| -------- | ------ | ----------------- |
| image    | file   | The meal image    |
| name     | string | The meal name     |
| calories | number | The meal calories |
| proteins | number | The meal proteins |
| lipids   | number | The meal lipids   |
| glucids  | number | The meal glucids  |
| fibers   | number | The meal fibers   |
| calcium  | number | The meal calcium  |

Response : 

- 201

```json
{
    "message": string,
    "status": number
}
```

- 401/404/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

### Get meal 

`GET meal?limit={limit}&id={id}`

Authentication :

> Jwt token require and only user/doctor role can use it

Parameters :

> Limit is the number of meal to get (0 = all)
> Id is the user_id (only for doctor)

Body :

> No body

Response : 

- 200

```json
{
    "meals": [
        {
            "_id": string,
            "image_path": string,
            "name": string,
            "calories": number,
            "proteins": number,
            "lipids": number,
            "glucids": number,
            "fibers": number,
            "calcium": number,
            "created_at": Date
        },
        ...
    ],
    "status": number
}
```

- 401/404/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

### Delete meal 

`DELETE meal?id={id}`

Authentication :

> Jwt token require and only user role can use it

Parameters :

> Pass as parameter the id of the meal to delete

Body :

> No body

Response : 

- 200

```json
{
    "message": string,
    "status": number
}
```

- 400/404/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

## Email

### Send Email

`POST sendEmail`

Authentication :

> Jwt token require

Parameters :

> No parameters

Body :

- Data must be sent as FormData.

| Name         | Type    | Description                                                   |
| ------------ | ------- | ------------------------------------------------------------- |
| files        | files   | Files to send (optionnal)                                     |
| prescription | boolean | If user want to send prescription (only for user)             |
| email        | string  | Recipients separe recipient with "," if there are more than 1 |
| subject      | string  | Email subject                                                 |
| body         | string  | Email body                                                    |

Response : 

> An email is send

- 201

```json
{
    "message": string,
    "status": number
}
```

- 404/422/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

### Get Email

`GET email`

Authentication :

> Jwt token require

Parameters :

> No parameters

Body :

> No body

Response : 

- 200

```json
{
    "emails": [
        {
            "_id": string,
            "sender": string,
            "recipient": string,
            "subject": string,
            "body": string,
            "attachment": [
                string
            ],
            "read": boolean,
            "created_at": Date,
            "__v": number
        },
        ...
    ],
    "status": number
}
```

- 404/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

## Product

### Create Product

`POST product`

Authentication :

> Jwt token require (role isn't define at this time for demo)

Parameters :

> No parameters

Body :

- Data must be sent as FormData.

| Name    | Type   | Description             |
| ------- | ------ | ----------------------- |
| name    | string | The product name        |
| content | string | The product description |
| price   | number | The product price       |
| image   | file   | The product image       |

Response : 

- 201

```json
{
    "message": string,
    "status" : number
}
```

- 404/422/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

### Get All Products

`GET product`

Authentication :

> Jwt token require (role isn't define at this time for demo)

Parameters :

> No parameters

Body :

> No body

Response : 

- 200

```json
{
    "products": [
        {
            "_id": string,
            "name": string,
            "content": string,
            "price": string,
            "image_path": string,
            "created_at": Date,
            "__v": number
        },
        ...
    ],
    "status" : number
}
```

- 404/422/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

## Order

### Create Order

`POST order`

Authentication :

> Jwt token require and only user role can use it

Parameters :

> No parameters

Body :

| Name         | Type   | Description                    |
| ------------ | ------ | ------------------------------ |
| id_product   | string | The product id                 |
| email_doctor | string | The doctor email to send order |

Response : 

> This request send email to doctor

- 201

```json
{
    "message": string,
    "status": number
}
```

- 404/409/422/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

### Get All Order

`GET order`

Authentication :

> Jwt token require and only user/health role can use it

Parameters :

> No parameters

Body :

> No body

Response : 

- 200

```json
{
    "orders": [
        {
            "_id": string,
            "id_product": string,
            "id_user": string,
            "product_name": string,
            "email_doctor": string,
            "status": string,
            "created_at": Date,
            "__v": number
        },
        ...
    ],
    "status": number
}
```

- 404/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

### Update Status Order

`PUT order`

Authentication :

> Jwt token require and only health role can use it

Parameters :

> No parameters

Body :

| Name     | Type   | Description                                   |
| -------- | ------ | --------------------------------------------- |
| id_order | string | The order id                                  |
| status   | string | The order status (pending, in progress, done) |

Response : 

- 200

```json
{
    "message": string,
    "status": number
}
```

- 401/404/422/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

## MedicalData (iot)

### Add data in db 

`POST medicalData`

Authentication :

> No authorization

Parameters :

> No parameters

Body :

- Data must be sent as FormData.

| Name    | Type   | Description   |
| ------- | ------ | ------------- |
| oxygen  | string | The oxygen    |
| pulse   | string | The pulsation |
| id_user | string | The user id   |

Response : 

- 201

```json
{
    "message": string,
    "status": number
}
```

- 404/422/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

### Get Medical Data 

`GET medicalData?limit={limit}&id={id_user}`

Authentication :

> Jwt token require and only user/health role can use it

Parameters :

> Limit for the number of data to get
> Id for the id_user to see (onbly for health role and doctor linked to this user)

Body :

> No body

Response : 

- 200

```json
{
    "data": [
        {
            "_id": string,
            "id_user": string,
            "pulse": number,
            "oxygen": numebr,
            "date": Date,
            "__v": number
        },
        ...
    ],
    "status": number
}
```

- 401/404/422/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

## Popup

### Create Daily popup

`POST new-daily-popup`

Authentication :

> Jwt token require and only blog role can use it

Parameters :

> No parameters

Body :

- Data must be sent as FormData.

| Name  | Type   | Description       |
| ----- | ------ | ----------------- |
| text  | string | The text on popup |
| image | file   | The popup image   |

Response : 

- 201

```json
{
    "message": string,
    "status": number
}
```

- 422/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error