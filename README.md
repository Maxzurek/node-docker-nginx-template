# node-docker-nginx-template

This is a template Node.js application built with Express and MongoDB, providing API endpoints for authentication.

## Prerequisites

Before running the application, make sure you have the following software installed on your system:

-   Node.js (v14 or higher)
-   MongoDB (running locally or accessible remotely)
-   Docker (see the docker-instructions.md file)

## Getting Started

### 1. Clone the repository:

```
git clone https://github.com/Maxzurek/node-docker-nginx-template.git
```

### 2. Install dependencies:

```
cd node-docker-nginx-template
npm install
```

### 3. Configure environment variables:

-   Create a `.env.prod` and `.env.dev` file in the project root directory.
-   Copy the content of `.env.example` into `.env.prod` and `.env.dev`.
-   Update the values of the environment variables according to your configuration.

### 4. Setup OAuth2:

This project is using OAuth2 with nodemailer to send confirmation emails.
Make sure you ([Setup OAuth2](https://dev.to/chandrapantachhetri/sending-emails-securely-using-node-js-nodemailer-smtp-gmail-and-oauth2-g3a)) and to update the values of the .env.\* OAUTH2\_ variables accordingly.

### 5. TODOs:

-   // TODO s were added throughout the application files. Make sure to check them out to ensure that the application is working properly.
-   If you are using VSCode, you can use an extension like ([Todo Tree](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree)) to spot them easily

### 6. Start the application in dev:

```
npm run dev
```

This will start the server at http://localhost:<port-number-from.env.dev>.

## Available Endpoints:

-   `POST /auth/register`: Register a new user.
-   `POST /auth/login`: Log in with existing credentials.
-   `GET /auth/verify-email/:verificationCode`: Verify user email address.
-   `POST /auth/resend-verification-email`: Resend verification email.

## Running the app with Docker:

Refer to the [docker-instructions.md](docker-instructions.md) file to run or configure docker.

## License

This project is licensed under the ([CC-BY-NC-ND License.](https://creativecommons.org/licenses/by-nc-nd/4.0/))
