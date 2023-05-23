/**
 * VERSION      : The Secret version set for the current secret in Cloud Secret Manager you want to retrieve with this script
 * PROJECT_NUM  : Google Cloud Project Number, to which the serets belongs to
 * SECRET       : The name of secret set in Google Cloud Secret Manger
 * 
 * These three work together to create id for the current secret being retrieved with the help of this script
 */
const VERSION = "latest";
const PROJECT_NUM = "XXXXXXXXXXXXXXXXX"; // replace with your project number
const SECRET = "Demo_Test";

/**
 * Use the Cloud Secret Manger API to retrieve the value for latest version of a specific secret
 * @see {@link https://cloud.google.com/secret-manager/docs/reference/rest/v1/projects.secrets.versions/access}
 */
function getSecretValue() {
  let endpoint, token, response, responseData, base64Value, byteArray;
  
  try {
    // Endpoint to retrieve details about latetst version of a specific secret in specific cloud project
    endpoint = `https://secretmanager.googleapis.com/v1/projects/${PROJECT_NUM}/secrets/${SECRET}/versions/${VERSION}:access`;
    // Google Cloud OAuth Token (Access Token) > Used to authenticate this script to access secret manager
    token = ScriptApp.getOAuthToken();
    // Hit the endpoint with valid authentication and response data headers, and grab the response
    response = UrlFetchApp.fetch(endpoint, {
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/json',
      }
    });
    // If the hit was successful the response code will be 200
    if (response.getResponseCode() == 200) {
      // Grab the response data as JSON by converting from response text (string)
      responseData = JSON.parse(response.getContentText());
      // Grab the base64 encoded value of the secret from response listed against payload > data keys 
      base64Value = responseData.payload.data;
      // Convert the base64 encoded value to UTF-8 Byte Array
      byteArray = Utilities.base64Decode(base64Value);
      // Convert the UTF-8 Byte array to valid javascript string and wirte to logger
      Logger.log(Utilities.newBlob(byteArray).getDataAsString())
    }
    // If the request was failed, the response code will not be 200 and no operation will be performed
    // Infact the code will throw error which is logged in the Logger
    else {
      throw `Failed! Response code is: ${response.getResponseCode()} and response text is ${response.getContentText()}`;
    }

  } catch (error) { Logger.log(error); }
}
