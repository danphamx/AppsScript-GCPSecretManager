/***
 * PARAMS         : Common headers/params that consist of OAuth token and response data type mandatory for REST request
 *                  The ScriptApp.getOAuthToken() returns access token for cloud resources
 *                  For this the to to work the appsscript.json must contain the following KEY-VALUE pair
 *                  "oauthScopes": [
 *                    "https://www.googleapis.com/auth/script.external_request",
 *                    "https://www.googleapis.com/auth/cloud-platform"
 *                  ]
 * 
 * isEmpty_       : Check if an array is empty or not, to make the code a little more robust
 * PROJECT_NUMBER : Google Cloud Project Number, to which the serets belongs to
 */

const PARAMS = { headers: { Authorization: `Bearer ${ScriptApp.getOAuthToken()}`, Accept: 'application/json' } }
const isEmpty_ = (value) => Boolean(Array.isArray(value) && !value.length);
const PROJECT_NUMBER = "XXXXXXXXXXXXXXXXX"; // replace with your project number

/**
 * Retrieves list of all secrets from one cloud project, grabs value for each secret and constructs
 * key value pairs for all secrets (@secretsPairs - these can be used later for further operations)
 * @see {@link https://cloud.google.com/secret-manager/docs/reference/rest/v1/projects.secrets/list}
 */
function allSecrets() {
  let endpoint, response, responseData, secretsIds, secretsPairs;

  try {
    // Endpoint to access all secrets in a google cloud project
    endpoint = `https://secretmanager.googleapis.com/v1/projects/${PROJECT_NUMBER}/secrets`;

    // Hit the endpoint with required parameters and grab the response
    response = UrlFetchApp.fetch(endpoint, PARAMS);
    // If the response was successfull the status code will be 200
    if (response.getResponseCode() == 200) {
      // Convert the response string to JSON
      responseData = JSON.parse(response.getContentText());
      // Grab the secrets from response object, the secrets key hods array of secret objects
      // Pass the array of object to parseArrayOfObjects function which returns an array of ids
      secretsIds = parseArrayOfObjects_(responseData.secrets);
      // If any secrets ids were found in the response object
      if (!isEmpty_(secretsIds)) {
        // Create a new empty object that later will hold all the secrets as (name:value)
        secretsPairs = new Object();
        // For each secret id, grab its value, and append it to the secrets pair object
        secretsIds.forEach(function (id) {
          // id is "projects/project_number/secrets/Secret_name"
          // id.split("/") is [ 'projects', 'project_number', 'secrets', 'Secret_name' ]
          // id.split("/").splice(-1) is ['Secret_name']
          // and id.slice("/").splice(-1)[0] is "Secret_name"
          // For each secret id, grab the secret value using getOnceSecretValue_
          // and store the scret value against the secret name in secretsPairs object
          secretsPairs[id.split("/").splice(-1)[0]] = getOnceSecretValue_(id);
        });
      }
      // If no ids were found, it means the project do not have any secrets and the program exits
      else { secretsPairs = "NO SECRET FOUND! Failed to process further, graceful exit"; }

      // NOTE : Print all pairs to Logger, these can be used for further processing
      Logger.log(secretsPairs)

    }
    // If the request was failed, the response code will not be 200 and no operation will be performed
    // Infact the code will throw error which is logged in the Logger
    else {
      throw `Failed! Response code is: ${response.getResponseCode()} and response text is ${response.getContentText()}`;
    }
  } catch (error) { Logger.log(error); }
}

/**
 * Use the Cloud Secret Manger API to retrieve the value for latest version of a secret
 * @see {@link https://cloud.google.com/secret-manager/docs/reference/rest/v1/projects.secrets.versions/access}
 */
function getOnceSecretValue_(id) {
  let endpoint, response, responseData, base64Value, byteArray;
  try {
    // Endpoint to access latest version of a specific secret value (based on id) 
    endpoint = `https://secretmanager.googleapis.com/v1/${id}/versions/latest:access`;
    // Hit the endpoint with required parameters and grab the response
    response = UrlFetchApp.fetch(endpoint, PARAMS);

    // If the response was successfull the status code will be 200
    if (response.getResponseCode() == 200) {
      // Convert the response string to JSON
      responseData = JSON.parse(response.getContentText());
      // Grab the base64 encoded value which is against payload > data keys in the response object
      base64Value = responseData.payload.data;
      // Convert the base64 encoded data to UTF-8 byte array
      byteArray = Utilities.base64Decode(base64Value);
      // Convert the UTF-8 byte array to valid javascript string and return the value as plain text
      return Utilities.newBlob(byteArray).getDataAsString();
    }
    // If the request was failed, the response code will not be 200 and no operation will be performed
    // Infact the code will throw error which is logged in the Logger
    else {
      throw `Failed! Response code is: ${response.getResponseCode()} and response text is ${response.getContentText()}`;
    }

  } catch (error) { Logger.log(error); }
}

/**
 * Extracts names for all secrets objects in the secrets array
 * @note {each secret has a name and for all secrets the names (ids) are stored in names array}
 */
function parseArrayOfObjects_(secrets) {
  let names = [];
  secrets.forEach((secret) => names.push(secret.name));
  return names;
}
