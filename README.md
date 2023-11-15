# LightBnB

A simple multi-page Airbnb clone that uses server-side Javascript to display the information from queries to web pages via SQL queries.
It allows users to sign up, log in and out, list properties for rent, browse available properties, and view their existing listings and reservations.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Usage Instructions](#usage-instructions)
3. [Dependencies](#dependencies)
4. [Requirements](#requirements)

## Getting Started

To get started with LightBnB, follow these steps:

1. Clone this repository to your local machine.
2. Install the necessary dependencies using `npm install`.
3. Create a new database using the provided SQL files.
4. Start the server using `npm run local`.

## Usage Instructions

After setting up the project as described in the "Getting Started" section, you can use the application as follows:

1. Open your web browser and navigate to `http://localhost:3000`.
2. Register a new account or log in with an existing one.
3. Use the search functionality to filter properties.

## Requirements

- Node.js: Required to run the server-side JavaScript code.
- PostgreSQL: Required to store and retrieve data from the database.
- npm: Required to install the necessary dependencies.

## Dependencies

- Node.js: This is the runtime environment that will execute the server-side JavaScript code.
- npm: This is the package manager for Node.js, used to install the necessary dependencies.
- Express: A web framework for Node.js used to build the web application.
- pg-native: A native PostgreSQL driver for Node.js, providing better performance than the pure JavaScript driver.
- EJS: A templating language for generating dynamic HTML pages.

### Middleware
- body-parser: A middleware for parsing incoming request bodies, allowing easy access to the data sent by the client.
- cookie-session: A middleware for storing session data in cookies, enabling persistent sessions.

### Libraries
- dotenv: A library for loading environment variables from a .env file, allowing configuration without hard-coding values.
- pg: A library for interacting with PostgreSQL databases, enabling data persistence.
- bcrypt: A library for hashing and comparing passwords, enhancing security.