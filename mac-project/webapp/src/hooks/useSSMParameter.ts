import { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import { post } from 'aws-amplify/api';
import { AWS_CONFIG } from '../config/aws-config';

// Configure Amplify if not already configured
Amplify.configure({
  API: {
    endpoints: [
      {
        name: 'SSMApi',
        endpoint: process.env.VITE_API_ENDPOINT || '',
        region: AWS_CONFIG.region
      }
    ]
  }
});

export const useSSMParameter = (parameterName: string) => {
  const [value, setValue] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParameter = async () => {
      if (!parameterName) {
        setError(new Error('Parameter name is required'));
        setLoading(false);
        return;
      }

      try {
        const session = await fetchAuthSession();
        
        const response = await post({
          apiName: 'SSMApi',
          path: '/parameters',
          options: {
            body: {
              parameterName
            }
          }
        });

        const data = await response.body.json();
        setValue(data.value ? data.value.trim() : null);
        setError(null);
      } catch (err) {
        console.error('SSM Parameter Error:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchParameter();
  }, [parameterName]);

  return { value, error, loading };
};