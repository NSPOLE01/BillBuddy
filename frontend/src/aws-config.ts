import { Amplify } from 'aws-amplify'

const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_9PI7HTvhL',
      userPoolClientId: '7c8ni0v0krv155oi0s216cimj3',
    },
  },
}

Amplify.configure(awsConfig)

export default awsConfig
