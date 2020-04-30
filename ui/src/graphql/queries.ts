import gql from 'graphql-tag';

export const SET_USERNAME = gql`
  mutation SetUsername($username: String!) {
    setUsername(username: $username) {
      id
      username
    }
  }
`;

export const GET_ALL_AGENTS = gql`
  query GetAllAgents {
    allAgents {
      id
      username
    }
  }
`