# REST SMTP transport server
## USAGE
JSON POST /api/mail
```
{
    name: string,
    subject: string,
    email: string,
    message: string
}
```
## SETTINGS
See .env.example
## RUN
```
$ npm i
$ npm start
```