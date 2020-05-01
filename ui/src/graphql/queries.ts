import gql from 'graphql-tag';

export const VOUCH_FOR_AGENT = gql`
  mutation VouchForAgent($agentId: ID!) {
    vouchForAgent(agentId: $agentId)
  }
`;
