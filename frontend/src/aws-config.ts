import { Amplify } from 'aws-amplify'

const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_9PI7HTvhL',
      userPoolClientId: '5sf5idq7pbta7q0h0utc1vomr3',
      loginWith: {
        oauth: {
          domain: 'us-east-19pi7htvhl.auth.us-east-1.amazoncognito.com',
          scopes: ['email', 'profile', 'openid'],
          redirectSignIn: ['http://localhost:5173'],
          redirectSignOut: ['http://localhost:5173'],
          responseType: 'code',
        },
      },
    },
  },
}

Amplify.configure(awsConfig)

export default awsConfig
