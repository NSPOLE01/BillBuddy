import { Amplify } from 'aws-amplify'

const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID || 'us-east-1_9PI7HTvhL',
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || '5sf5idq7pbta7q0h0utc1vomr3',
      loginWith: {
        oauth: {
          domain: import.meta.env.VITE_COGNITO_DOMAIN || 'us-east-19pi7htvhl.auth.us-east-1.amazoncognito.com',
          scopes: ['email', 'profile', 'openid'],
          redirectSignIn: [import.meta.env.VITE_REDIRECT_SIGN_IN || 'http://localhost:5173'],
          redirectSignOut: [import.meta.env.VITE_REDIRECT_SIGN_OUT || 'http://localhost:5173'],
          responseType: 'code' as const,
        },
      },
    },
  },
}

Amplify.configure(awsConfig)

export default awsConfig
