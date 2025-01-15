import { useAmplifySecretValue } from './useAmplifySecretValue';

interface SecretConfig {
  secretArn: string;
  key: string;
}

/**
 * Custom hook for fetching secret values using AWS Amplify
 * @param config The secret configuration containing secretArn and key
 * @returns Object containing the secret value, error state, and loading state
 */
export const useSecretValue = (config: SecretConfig) => {
  return useAmplifySecretValue(config);
};