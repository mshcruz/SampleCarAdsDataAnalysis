/**
 * Make a request to the Google Vision API to analyse the image found in the specified URL.
 * @param {string} imageURL The URL to the image to be submitted to the Google Vision API.
 * @returns {string} The text response returned by the API.
 * @throws Will throw an error if it is not possible to find the Google Vision API key.
 */
function makeRequest(imageURL) {
  const userProperties = PropertiesService.getUserProperties();
  const apiKey = userProperties.getProperty('ADS_ANALYSIS_DEMO_API_KEY');
  if (!apiKey) {
    throw new Error('It was not possible to find the Google Vision API key.');
  }
  const visionApiUrl =
    'https://vision.googleapis.com/v1/images:annotate?key=' + apiKey;
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      requests: [
        {
          image: {
            source: {
              imageUri: imageURL,
            },
          },
          features: [
            {
              type: 'LABEL_DETECTION',
              maxResults: 10,
            },
            {
              type: 'OBJECT_LOCALIZATION',
              maxResults: 10,
            },
            {
              type: 'TEXT_DETECTION',
            },
          ],
        },
      ],
    }),
  };
  const response = UrlFetchApp.fetch(visionApiUrl, options);
  return response.getContentText();
}

/**
 * Filter function to remove duplicated values in an array.
 * From: https://stackoverflow.com/a/14438954/3751868
 */
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

/**
 * Calculates the average of values in the specified array.
 * From https://stackoverflow.com/a/41452260/3751868
 * @param {number[]} array The numbers whose average should be calculated.
 * @returns {number} The average.
 */
const average = (array) => array.reduce((a, b) => a + b) / array.length;
