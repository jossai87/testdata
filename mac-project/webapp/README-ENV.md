# Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update the `.env` file with your AWS credentials:

- `VITE_AWS_REGION`: Your AWS region (defaults to us-west-2)
- `VITE_AWS_ACCOUNT_ID`: Your AWS account ID (defaults to 147997158388)
- `VITE_AWS_ACCESS_KEY_ID`: Your AWS access key with SecretsManager read permissions
- `VITE_AWS_SECRET_ACCESS_KEY`: Your AWS secret access key

3. Make sure your AWS credentials have permissions to read the following secrets:

- mac-collaboration/websocketid-uoHk6I
- mac-collaboration/ids-cfSMND

The values will be loaded into the connection settings fields when the chatbot page loads.