// Libraries
import gql from "graphql-tag";

const FEED_QUERY = gql`
  {
    feed {
      links {
        id
        description
        url
        createdAt
        votes {
          id
          user {
            id
          }
        }
        postedBy {
          name
        }
      }
    }
  }
`;

const POST_MUTATION = gql`
  mutation PostMutation($description: String!, $url: String!) {
    post(description: $description, url: $url) {
      id
      createdAt
      url
      description
    }
  }
`;

const SIGNUP_MUTATION = gql`
  mutation SignupMutation($email: String!, $password: String!, $name: String!) {
    signup(email: $email, password: $password, name: $name) {
      token
    }
  }
`
const LOGIN_MUTATION = gql`
  mutation LoginMutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
    }
  }
`

const VOTE_MUTATION = gql`
  mutation VoteMutation($linkId: ID!) {
    vote(linkId: $linkId) {
      id
      link {
        votes {
          id
          user {
            id
          }
        }
      }
      user {
        id
      }
    }
  }
`

export default {
  FEED_QUERY,
  POST_MUTATION,
  SIGNUP_MUTATION,
  LOGIN_MUTATION,
  VOTE_MUTATION,
}
