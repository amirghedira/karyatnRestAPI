# Overview 
To better understand the whole application it would be preferable to take a look on the frontend application [here](https://www.amirghedira.com/project/Karyatn%20Frontend/Angular/60d747d2d7e12a0017340e6f).

The main goal of this project is to build a restful API using Expressjs framework as a backend for a website that rent cars to clients and allow car owners to publish their car.

# Launch the project
To launch the project, you have to first add a `.env` file in the root directory that will hold the environment variables of the backend. You can find a `.env.example` folder as reference for the environment variables used.
Note that you need a cloudinary account to used in the backend as storage service.

After adding a `.env` file, you have to install the NodeJS packages on the backend

To install the backend Node packages, simply run:
``` bash
npm install
```
To run the backend server, run:
``` bash
npm start
```
To run the backend server in development mode, run:
``` bash
npm run dev
```
Note that the server will listen on port `3000`

# Features 

## Databases and storage services
This API uses mongoDB as a database to store data and Cloudinary which is a service that offers object storage for images/videos.

## API
This API follows the standars of being restful but also the file structure is divided in a way to find contollers, middlewares and routes.

![file structure](https://amirplatform.s3.eu-central-1.amazonaws.com/project/1668251767566-Screenshot%202022-11-12%20at%2012.15.52.png)
## Mailing
In addition, the website using SMTP mailing to confirm user account creation but also to notify clients/businesses of latest notifications (new available car for a client / a rent that will finish very soon for the bussiness company).
We have used sendgrid as an SMTP service for this API that delivers the emails to our end users.

![sendgrid](https://amirplatform.s3.eu-central-1.amazonaws.com/project/1668251998306-Screenshot%202022-11-12%20at%2012.19.22.png)

## Models
As a data structure we only have 3 models which are User, Car, Rent.

![data_structure](https://amirplatform.s3.eu-central-1.amazonaws.com/project/1668252166670-Screenshot%202022-11-12%20at%2012.22.36.png)

## Middelwares

Finally for authentification management we have used json web token or jwt for short which allow us to generate a token for the end user whenever they login to their accounts that way we can protect routes which requires an authentification. For this purpose we created a middleware named checkAuth.js in the middleware folder. the checkAuth serves as a middleware before the controller (which needs the user to be authentificated) to check whether an access token is present in the header or not and also check the validity and expriration of that token before redirecting the request to the protected controller.


# Platform & Libraries 
 In this back end , i used well known libraries which are:
```json
{
        "bcrypt": "^4.0.1",
        "body-parse": "^0.1.0",
        "cloudinary": "^1.20.0",
        "express": "^4.17.1",
        "hogan.js": "^3.0.2",
        "jsonwebtoken": "^8.5.1",
        "mongoose": "^5.9.5",
        "multer": "^1.4.2",
        "multer-storage-cloudinary": "^2.2.1",
        "nodemailer": "^6.4.6",
        "nodemon": "^2.0.2",
        "socket.io": "^2.3.0",
}
```
The first main libraries are:

[nodemon]([https://www.npmjs.com/package/nodemon](https://www.npmjs.com/package/nodemon)):
Is a very useful tool , actually with nodemon you don't need to stop the server and rerun it again whenever you update your code. Actually, when you save changes the server restart automatically.Also with nodemon installed you can created a file named nodemon.json in which you store your environment variables (process.env.VARIABLE)

[Express](https://www.npmjs.com/package/express):
Which is a framework of nodejs , which makes easier handling HTTP request and responses.

[Hogan.js](https://www.npmjs.com/package/hogan.js/v/3.0.2):
This is a templating engine which allows us to inject data into HTML templates that we later send them to our users.

[nodemailer](https://www.npmjs.com/package/nodemailer):
Allows as to send emails from nodejs by connecting to an SMTP mailer.

[Mongoose]([https://www.npmjs.com/package/mongoose](https://www.npmjs.com/package/mongoose)): 
is a mongodb driver in nodejs that provides a straight-forward, schema-based solution to model your application data. It includes built-in type casting, validation, query building, business logic hooks and more, out of the box.
You can also use mongodb driver (default) it will work too but with different syntax and methodologies

[body-parse](https://www.npmjs.com/package/body-parser):
Is a library , that allow the backend to parse the body and get data from the request (you can't get data from req.body without this library)
The other packages are optional, but they provide more functionality.

[jsonwebtoken]([https://www.npmjs.com/package/jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)):
Is a library responsible to manage tokens, it generates tokens from a payload you add, and you can make user authentication
with it, also you can protect some routes using a middleware that checks the token, you can add more options to it like the expiration time, etc... check out the docs below


[multer-storage-cloudinary](https://www.npmjs.com/package/multer-storage-cloudinary)/[multer](https://www.npmjs.com/package/multer):
I used both of those libraries as a middleware to store data in [cloudinary]([https://cloudinary.com](https://cloudinary.com)) which is a cloud storage (storing only images and videos)
You can use multer by its own to store files in your local storage, that's the default use case of multer.

[Cloudinary](https://www.npmjs.com/package/cloudinary): 
Is a driver for cloudinary , responsible to connect and send requests to cloudinary, and provides multiple functionalities.

[bcrypt](https://www.npmjs.com/package/bcrypt):
Is a small library, that provides a secure hashing method that you can use to hash plain text passwords before storing them into the database, also it provides a method that compares the  hashed passwords and an entered password (plain text) 
you can use this functionality in login handler.

[socket.io](https://www.npmjs.com/package/socket.io):
As i mentioned in the front end project, I used client-side socketio , in the back end you have to use socketio server-side to register your listeners, in the server and emit them or broadcast them into all the sockets connected to your website