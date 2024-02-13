# Api Diwe

This api is made by NodeJs and Mongo DB

## Installation

1. Clone the repository
2. Run `npm install`
3. Create a database
4. Copy the `.env.example` file to `.env` 

## Usage

Run `node index`

## Authentication

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

-   201

```json
{
    "status": number,
    "message" : string
}
```

- 401 

```json
{
    "error": string,
    "status": number
}
```

> The message depends on the error

### Login

`GET auth/login`

Authentication :

> No authentication

Parameters:

> No parameters

Body :

| Name     | Type   | Description              |
| -------- | ------ | ------------------------ |
| email    | string | The email of the user    |
| password | string | The password of the user |

Response :

- 200

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

- 401

```json
{
  "error": string,
  "status": number
}
```

> The message depends on the error

## Popup

### Create Daily popup

`POST new-daily-popup`

Authentication :

> Jwt token require and only blog role can use it

Parameters :

> no parameters

Body :

- Data must be sent as FormData.

| Name  | Type   | Description       |
| ----- | ------ | ----------------- |
| text  | string | The text on popup |
| image | string | The popup image   |

Response : 

- 201

```json
{
    "message": string,
    "status": number
}
```

- 401

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error