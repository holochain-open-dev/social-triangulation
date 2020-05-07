import gql from 'graphql-tag';

export const VOUCH_FOR_AGENT = gql`
  mutation VouchForAgent($agentId: ID!) {
    vouchForAgent(agentId: $agentId)
  }
`;

export const JOIN_NETWORK = gql`
  mutation JoinNetwork($agentId: ID!) {
    joinNetwork(agentId: $agentId)
  }
`;
