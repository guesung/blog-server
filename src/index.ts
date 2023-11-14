import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import mysql from 'mysql';
import dotenv from 'dotenv';
dotenv.config();

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'mysql'
});

db.connect(err => {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
});

const typeDefs = `#graphql
  type Chat {
    message: String
    date: String
  }
  type Query {
    chats: [Chat]
  }
  type Mutation {
  addChat(message: String!, date: String!): Chat
}
`;

const resolvers = {
  Query: {
    chats: () => new Promise((resolve, reject) => {
      db.query('SELECT * FROM chats', (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    })
  },
  Mutation: {
    addChat: (_, { message, date }) => {
      return new Promise((resolve, reject) => {
        const query = 'INSERT INTO chats (message, date) VALUES (?, ?)';
        db.query(query, [message, date], (error, results) => {
          if (error) {
            return reject(error);
          }
          resolve({ message, date });
        });
      });
    },
  },

};
const server = new ApolloServer({
  typeDefs,
  resolvers,
});
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
