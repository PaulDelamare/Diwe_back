# Api Diwe

This api is made by NodeJs and Mongo DB

## Insatllation

1. Clone the repository
2. Run `npm install`
3. Create a database
4. Copy the `.env.example` file to `.env` 

## Usage

Run `node index`

### Register

`POST auth/register`

Authentication:

> No authentication

Parameters:

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
    "status": string,
    "message" : string
}
```

- 401 

```json
{
    "error": string
}
```

> The message depends on the error

### Login

`GET auth/login`

Authentication:

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
    "status":  string
}
```

- 401

```json
{
  "error": string,
  "status": string
}
```

> The message depends on the error