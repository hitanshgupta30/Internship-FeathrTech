Basic simulation of API calls using Postman.

Database setup
- Add your MongoDB connection string to a `.env` file at the project root with the variable `MONGODB_URI`.
	Use the provided `.env.example` as a template.

Run
```
npm install
npm start
```

Notes
- The server uses Mongoose and expects `MONGODB_URI` to be set. If it's not set the server will still start but won't be connected to MongoDB.