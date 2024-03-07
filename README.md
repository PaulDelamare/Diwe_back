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

- 401/422/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status depends on the error

## User

### Update user password

`PUT user/update-password`

Authentication :

> Jwt token require

Parameters :

> No parameters

Body :

- Data must be sent as FormData.

| Name        | Type   | Description           |
| ----------- | ------ | --------------------- |
| password    | string | The user password     |
| newPassword | string | The new user password |

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

### Update user email

`PUT user/update-email`

Authentication :

> Jwt token require

Parameters :

> No parameters

Body :

- Data must be sent as FormData.

| Name        | Type   | Description           |
| ----------- | ------ | --------------------- |
| password    | string | The user password     |
| email       | string | The new user email    |

Response :

- 200 

```json
{
    "message": string,
    "status": number,
    "reconnect_required": boolean
}
```

> The succes of this operation **need the reconnection og the user**

- 401/404/422/500

```json
{
  "error": string,
  "status": number
}
```

> The message and the status error depends on the error

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

### Request link to doctor

`POST user/request-link`

Authentication :

> Jwt token require

Parameters :

> No parameters

Body :

| Name      | Type   | Description        |
| --------- | ------ | ------------------ |
| link_code | string | The user firstname |

Response :

- 201

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
| image | file | The popup image   |

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