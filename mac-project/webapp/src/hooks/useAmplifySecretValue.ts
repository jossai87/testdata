import { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import { post } from 'aws-amplify/api';
import { AWS_CONFIG } from '../config/aws-config';

interface SecretConfig {
  secretArn: string;
  key: string;
}

// Configure Amplify
Amplify.configure({
  API: {
    endpoints: [
      {
        name: 'SecretsApi',
        endpoint: process.env.VITE_API_ENDPOINT || '',
        region: AWS_CONFIG.region
      }
    ]
  }
});

export const useAmplifySecretValue = ({ secretArn, key }: SecretConfig) => {
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setValue('');
    setError(null);
    setLoading(true);
  }, [secretArn, key]);

  useEffect(() => {
    const fetchSecret = async () => {
      try {
        setLoading(true);
        const session = await fetchAuthSession();
        
        const response = await post({
          apiName: 'SecretsApi',
          path: '/secrets',
          options: {
            body: {
              secretArn,
              key
            }
          }
        });

        const data = await response.body.json();
        setValue(data.value || '');
        setError(null);
      } catch (err) {
        console.error('Error fetching secret:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    if (secretArn && key) {
      fetchSecret();
    }
  }, [secretArn, key]);

  return { value, error, loading };
};