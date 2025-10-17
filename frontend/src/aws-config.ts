import { Amplify } from 'aws-amplify'

const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_9PI7HTvhL',
      userPoolClientId: '5sf5idq7pbta7q0h0utc1vomr3',
    },
  },
}

Amplify.configure(awsConfig)

export default awsConfig
