# SSM Parameter Store Configuration

The application requires the following SSM parameters to be set up in your AWS account:

- `/contact-lens-supervisor/agent-id`: The Contact Lens Supervisor Agent ID
- `/contact-lens-supervisor/alias-id`: The Contact Lens Supervisor Alias ID

These parameters should be created as SecureString type in AWS Systems Manager Parameter Store.

## Local Development

For local development, ensure you have:

1. AWS credentials configured (either via environment variables, AWS CLI configuration, or IAM role)
2. Required permissions to access the SSM parameters
3. Proper region set in the environment (VITE_AWS_REGION)

## Required IAM Permissions

The following IAM permissions are required:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ssm:GetParameter"
            ],
            "Resource": [
                "arn:aws:ssm:*:*:parameter/contact-lens-supervisor/*"
            ]
        }
    ]
}
```