import gql from 'graphql-tag';

export const socialTriangulationTypeDefs = gql`
  extend type Mutation {
    vouchForAgent(agentId: ID!): Boolean!
    joinNetwork(agentId: ID!): Boolean!
  }

  extend type Agent {
    vouchesCount: Int!
    isInitialMember: Boolean!
  }

  extend type Query {
    minVouches: Int!
  }
`;
