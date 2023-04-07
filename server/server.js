const express = require('express');
const path = require('path');
const db = require('./config/connection');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');

const app = express();
const PORT = process.env.PORT || 14916;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Create the Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // Apply the authMiddleware to the request object and pass it to the context
    const authenticatedReq = authMiddleware({ req });
    return { user: authenticatedReq.user };
  },
});

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}
const startServer = async ()=>{ await server.start();
  // And apply the middleware
  server.applyMiddleware({ app });
// Start the server after the Apollo Server has been applied
db.once('open', async () => {
  // Add this line


  app.listen(PORT, () => {
    console.log(`🌍 Now listening on localhost:${PORT}`);
    console.log(`🚀 GraphQL Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
});
};
startServer();