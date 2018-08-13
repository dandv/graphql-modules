export default `
  type Query {
    me: User
    users: [User]
  }

  type User {
    id: ID!
    name: String
    picture: String
    phone: String
  }
`;