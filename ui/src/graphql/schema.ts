import gql from 'graphql-tag';

export const socialTriangulationTypeDefs = gql`
  type Agent {
    id: ID!
    username: String!
  }

  extend type Query {
    allAgents: [Agent!]!
    me: Agent!
  }

  extend type Mutation {
    setUsername(username: String!): Agent!
  }
`;
