#!/bin/bash
set -e
rm -f ./src/.env || true
export AWS_SDK_LOAD_CONFIG=1

echo "setting up webapp environment variables" 

ENV_REGION=$AWS_REGION
ENV_PREFIX=$projectName

# manual deploy
ENV_REGION=us-west-2
ENV_PREFIX=prod-desc-gen

# read the region export (all stacks) and create a DOT ENV file
# the files are used to configure the UI
get_export() {
  aws cloudformation --region ${ENV_REGION} list-exports --query "Exports[?Name=='${ENV_PREFIX}-${1}'].[Value]" --output text  
}

#export project-name
echo "VITE_PROJECT_NAME=$ENV_PREFIX" >>  ./src/.env
# export region 
echo "VITE_REGION=$ENV_REGION" >>  ./src/.env

# export AWS cognito Auth related configs 
echo VITE_CONFIG_COGNITO_IDENTITYPOOL_ID=$(get_export config-cognito-identitypool-id) >>  ./src/.env
echo VITE_CONFIG_COGNITO_USERPOOL_ID=$(get_export config-cognito-userpool-id) >>  ./src/.env
echo VITE_CONFIG_COGNITO_APPCLIENT_ID=$(get_export config-cognito-appclient-id) >>  ./src/.env 
echo VITE_CONFIG_COGNITO_DOMAIN=$(get_export config-cognito-domain) >>  ./src/.env
echo VITE_CONFIG_COGNITO_CALLBACK_URL=$(get_export config-cognito-callback-url) >>  ./src/.env
# export HTTP API Endpoint Url
echo VITE_CONFIG_HTTP_API_URL=$(get_export config-apigateway-api-url-output) >>  ./src/.env
# export REST API Edge Endpoint Url
echo VITE_CONFIG_REST_API_URL=$(get_export config-apigateway-rest-api-url-output) >>  ./src/.env
# export data Bucket name 
echo VITE_CONFIG_S3_DATA_BUCKET_NAME=$(get_export config-s3-data-bucket-name) >>  ./src/.env
echo "webapp env file created successfully!"
cat ./src/.env