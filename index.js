const { ApolloServer, gql } = require("apollo-server");
const { buildSubgraphSchema } = require("@apollo/federation");

const typeDefs = gql`
  type Book @key(fields: "id") {
    id: ID!
    title: String
    author: Author
  }

  type Author @key(fields: "id") {
    id: ID!
    name: String
    books: [Book]
  }

  type Query {
    books: [Book]
    authors: [Author]
    book(id: ID!): Book
    author(id: ID!): Author
  }

  type Mutation {
    createBook(title: String!, authorId: ID!): Book
    createAuthor(name: String!): Author
    editBook(id: ID!, newTitle: String!): Book
    editAuthor(id: ID!, newName: String!): Author
    deleteBook(id: ID!): Book
    deleteAuthor(id: ID!): Author
  }
`;

let authors = [
  { id: "1", name: "J.K. Rowling" },
  { id: "2", name: "J.R.R. Tolkien" },
];

let books = [
  { id: "1", title: "Harry Potter and the Sorcerer's Stone", authorId: "1" },
  { id: "2", title: "The Lord of the Rings", authorId: "2" },
];

const resolvers = {
  Query: {
    books: () => books,
    authors: () => authors,
    book: (_, { id }) => books.find((book) => book.id === id),
    author: (_, { id }) => authors.find((author) => author.id === id),
  },

  Mutation: {
    createAuthor: (_, { name }) => {

      if (authors.find((author) => author.name === name)) {
        throw new Error("Author already exists");
      }

      const newAuthor = { id: String(authors.length + 1), name };
      authors.push(newAuthor);
      return newAuthor;
    },

    createBook: (_, { title, authorId }) => {
      if (books.find((book) => book.title === title)) {
        throw new Error("Book already exists");
      }
      
      if (!authors.find(({ id }) => id === authorId)) {
        throw new Error("Author not found");
      }
      const newBook = { id: String(books.length + 1), title, authorId };
      books.push(newBook);
      return newBook;
    },

    editBook: (_, { id, newTitle }) => {
      const book = books.find((book) => book.id === id);
      if (!book) {
        throw new Error("Book not found");
      }

      if (books.find((book) => book.title === newTitle)) {
        throw new Error("Book title already exists");
      }

      book.title = newTitle;
      return book;
    },

    editAuthor: (_, { id, newName }) => {
      const author = authors.find((author) => author.id === id);
      if (!author) {
        throw new Error("Author not found");
      }

      if (authors.find((author) => author.name === newName)) {
        throw new Error("Author name already exists");
      }

      author.name = newName;
      return author;
    },

    deleteBook: (_, { id }) => {
      const book = books.find((book) => book.id === id);
      if (!book) {
        throw new Error("Book not found");
      }

      books = books.filter((book) => book.id !== id);
      return book;
    },

    deleteAuthor: (_, { id }) => {
      const author = authors.find((author) => author.id === id);
      if (!author) {
        throw new Error("Author not found");
      }

      authors = authors.filter((author) => author.id !== id);
      return author;
    }
  },

  Book: {
    author(book) {
      return authors.find(({ id }) => id === book.authorId);
    },
  },

  Author: {
    books(author) {
      return books.filter((book) => book.authorId === author.id);
    },
  },
};

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
});

server.listen({ port: 4001 }).then(({ url }) => {
  console.log(`Subgraph server running on ${url}`);
});
