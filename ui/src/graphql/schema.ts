import gql from 'graphql-tag';

export const socialTriangulationTypeDefs = gql`
  extend type Mutation {
    vouchForAgent(agentId: ID!): Boolean!
  }
`;
