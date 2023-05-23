# AppsScript-GCPSecretManager
Some helper functions that allow you to query GCP Secret Manager from Google Apps Script

## Use Case
Take your security to the next level. Use this code to query GCP Secret Manager and retrieve your credentials, api keys, or secrets when developing in Apps Script.

## Explainer

This code is used to retrieve the value of a secret from Google Cloud Secret Manager using the Secret Manager API. Let's break down the code step by step:

Constants:

- VERSION: The version of the secret to retrieve. In this case, it is set to "latest" to retrieve the latest version of the secret.

- PROJECT_NUM: The Google Cloud Project Number. It represents the project to which the secrets belong. You need to replace it with your actual project number.

- SECRET: The name of the secret to retrieve. In this case, it is set to "Demo_Test".

`getSecretValue()` function:

1. This function is responsible for retrieving the value of the secret.
2. It starts by declaring several variables: endpoint, token, response, responseData, base64Value, and byteArray.
3. The endpoint variable is constructed with the project number, secret name, and version to create the URL for retrieving the secret.
4. The token variable is assigned the OAuth token (Access Token) obtained using ScriptApp.getOAuthToken(). This token is used for authentication to access the secret manager.
5. The UrlFetchApp.fetch() function is used to make an HTTP request to the endpoint URL with the necessary headers (including the authorization token).
6. The response from the API call is stored in the response variable.
7. If the response code is 200 (indicating a successful request), the code proceeds to extract the secret value.
8. The response data is parsed as JSON using JSON.parse(), and the base64-encoded value of the secret is extracted from the payload.data property of the response.
8. The base64-encoded value is then decoded using Utilities.base64Decode() to obtain a UTF-8 byte array.
9. Finally, the byte array is converted to a JavaScript string using Utilities.newBlob(byteArray).getDataAsString() and logged to the Logger.
10. If the response code is not 200, an error is thrown, indicating the failure and providing the response code and content as the error message.
11. Any errors that occur during the execution of the code are caught in a catch block, and the error message is logged to the Logger.

Overall, this code retrieves the latest version of a specific secret from Google Cloud Secret Manager by making an API request and extracts the secret value for further processing or logging.
