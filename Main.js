/**
 * @author Mateus Cruz <mshcruz@gmail.com>
 *
 * Analyse the performance of image ads considering characteristics of the images.
 * These characteristics are retrieved using the Google Vision API: https://cloud.google.com/vision
 *
 * Sample ads data: https://docs.google.com/spreadsheets/d/1KZ0W8KH-MZGry0-10BWzzYUBwr0DxeCcEowf5uXZDHY/
 *
 * To Do:
 * - Remove stop words, stemming
 */

// Settings
const apiKeyPropertyName = 'ADS_ANALYSIS_DEMO_API_KEY';
const adsSampleDataSheetName = 'Ads Sample Data';
const labelsAnalysisSheetName = 'Labels Analysis';
const objectsAnalysisSheetName = 'Objects Analysis';
const wordsAnalysisSheetName = 'Words Analysis';
const urlColumnIndex = 1;
const impressionsColumnIndex = 3;
const clicksColumnIndex = 4;
const ctrColumnIndex = 5;
const costColumnIndex = 6;
const objectsColumnIndex = 7;
const labelsColumnIndex = 8;
const textColumnIndex = 9;

/**
 * Analyse the images in the sample sheet using the Google Vision API.
 * The result of the analysis include objects, labels and text related to each image.
 */
function analyseAdsImages() {
  checkAPIKey();
  const imagesAnalysisDataRows = [];

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    adsSampleDataSheetName
  );
  const urlRows = sheet
    .getRange(2, urlColumnIndex, sheet.getLastRow() - 1, 1)
    .getDisplayValues();

  for (const urlRow of urlRows) {
    try {
      imagesAnalysisDataRows.push(getImageData(urlRow[0]));
    } catch (error) {
      console.error(
        `It was not possible to process image (URL: ${urlRow[0]}): ${error.message} at ${error.stack}`
      );
    }
  }

  if (imagesAnalysisDataRows.length > 0) {
    sheet
      .getRange(
        2,
        objectsColumnIndex + 1,
        imagesAnalysisDataRows.length,
        imagesAnalysisDataRows[0].length
      )
      .setValues(imagesAnalysisDataRows);
  }
}

/**
 * Analyse the image whole URL is specified using the Google Vision API.
 * @param {string} url The URL of the image to be analysed using the Google Vision API.
 * @returns {string[]} The analysis data for the image.
 */
function getImageData(url) {
  let imageObjects = '';
  let imageLabels = '';
  let imageText = '';

  const response = JSON.parse(makeRequest(url));
  if (response.responses[0].localizedObjectAnnotations) {
    imageObjects = response.responses[0].localizedObjectAnnotations
      .map((obj) => obj.name)
      .filter(onlyUnique)
      .join(',');
  }
  if (response.responses[0].labelAnnotations) {
    imageLabels = response.responses[0].labelAnnotations
      .map((label) => label.description)
      .filter(onlyUnique)
      .join(',');
  }
  if (response.responses[0].textAnnotations) {
    imageText = response.responses[0].textAnnotations
      .map((text) => text.description)
      .filter(onlyUnique)
      .join('\n');
  }

  return [imageObjects, imageLabels, imageText];
}

/**
 * Output the performance data (i.e., impressions, clicks, CTR and cost) for the each of the images' entities (i.e., objects, labels and words).
 */
function outputImagesPerformanceAnalyses() {
  const objectsPerformance = {};
  const labelsPerformance = {};
  const wordsPerformance = {};
  const adsSampleDataSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
      adsSampleDataSheetName
    );
  const adsData = adsSampleDataSheet.getDataRange().getValues();
  adsData.shift();

  for (const adData of adsData) {
    try {
      const adObjects = adData[objectsColumnIndex]
        .split(',')
        .filter(String)
        .filter(onlyUnique);
      getEntityPerformance(adObjects, objectsPerformance, adData);

      const adLabels = adData[labelsColumnIndex]
        .split(',')
        .filter(String)
        .filter(onlyUnique);
      getEntityPerformance(adLabels, labelsPerformance, adData);

      const adWords = adData[textColumnIndex]
        .split(/\s/g)
        .filter(String)
        .filter(onlyUnique);
      getEntityPerformance(adWords, wordsPerformance, adData);
    } catch (error) {
      console.error(
        `Error when analysing ad: ${error.message} at ${error.stack}`
      );
    }
  }

  outputAnalysis(objectsAnalysisSheetName, objectsPerformance);
  outputAnalysis(labelsAnalysisSheetName, labelsPerformance);
  outputAnalysis(wordsAnalysisSheetName, wordsPerformance);
}

/**
 * Pivot the ads performance data into performance for values of each entity (i.e., objects, labels and words).
 * @param {string[]} entityValues The values returned by Google Vision API for an entity (i.e., objects, labels and words).
 * @param {object} entityValuesPerformance The performance data for values of an entity.
 * @param {string[]} adData The ads performance data.
 */
function getEntityPerformance(entityValues, entityValuesPerformance, adData) {
  for (const entityValue of entityValues) {
    if (entityValuesPerformance[entityValue]) {
      entityValuesPerformance[entityValue].impressions.push(
        adData[impressionsColumnIndex]
      );
      entityValuesPerformance[entityValue].clicks.push(
        adData[clicksColumnIndex]
      );
      entityValuesPerformance[entityValue].ctr.push(adData[ctrColumnIndex]);
      entityValuesPerformance[entityValue].cost.push(adData[costColumnIndex]);
    } else {
      entityValuesPerformance[entityValue] = {
        impressions: [adData[impressionsColumnIndex]],
        clicks: [adData[clicksColumnIndex]],
        ctr: [adData[ctrColumnIndex]],
        cost: [adData[costColumnIndex]],
      };
    }
  }
}

/**
 * Write the performance data (i.e., impressions, clicks, CTR and cost) for the specified entity (i.e., objects, labels and words).
 * @param {string} entityAnalysisSheetName The name of the sheet to which analysis data should be output.
 * @param {object} entityValuesPerformance The performance data for values of an entity.
 */
function outputAnalysis(entityAnalysisSheetName, entityValuesPerformance) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  // Prepare output sheet
  let entitiesAnalysisSheet = spreadsheet.getSheetByName(
    entityAnalysisSheetName
  );
  if (!entitiesAnalysisSheet) {
    entitiesAnalysisSheet = spreadsheet.insertSheet(entityAnalysisSheetName);
  }
  entitiesAnalysisSheet.clear();
  if (entitiesAnalysisSheet.getFilter()) {
    entitiesAnalysisSheet.getFilter().remove();
  }

  // Format data to output
  const entitiesAnalysisRows = [];
  for (const [name, performance] of Object.entries(entityValuesPerformance)) {
    entitiesAnalysisRows.push([
      name,
      average(performance.impressions),
      average(performance.clicks),
      average(performance.ctr),
      average(performance.cost),
    ]);
  }

  if (entitiesAnalysisRows.length > 0) {
    // Add headers
    const entityName = entityAnalysisSheetName.split(' ')[0];
    entitiesAnalysisRows.unshift([
      entityName,
      'Impressions',
      'Clicks',
      'CTR',
      'Cost',
    ]);

    // Output data
    const entityAnalysisRange = entitiesAnalysisSheet.getRange(
      1,
      1,
      entitiesAnalysisRows.length,
      entitiesAnalysisRows[0].length
    );
    entityAnalysisRange.setValues(entitiesAnalysisRows);

    // Apply formatting
    entityAnalysisRange.applyRowBanding();
    entityAnalysisRange.createFilter();
  }
}

/**
 * Empty function used to prompt user for permissions to run the script.
 */
function authorize() {}

/**
 * Checks whether the Google Vision API key is initialized, prompting the user for a key if necessary.
 * @throws Will throw an error if the user does not specify a key.
 */
function checkAPIKey() {
  const userProperties = PropertiesService.getUserProperties();

  if (userProperties.getProperty(apiKeyPropertyName)) {
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Enter your Google Vision API key:');
  if (
    response.getSelectedButton() == ui.Button.OK &&
    response.getResponseText().length > 0
  ) {
    userProperties.setProperty(apiKeyPropertyName, response.getResponseText());
  } else {
    throw new Error('Google Vision API key not specified.');
  }
}

/**
 * Clear data retrieved from Google Vision API and remove analyses sheets.
 */
function resetDemoData() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  const adsSampleDataSheet = spreadsheet.getSheetByName(adsSampleDataSheetName);
  adsSampleDataSheet
    .getRange(
      2,
      objectsColumnIndex + 1,
      adsSampleDataSheet.getLastRow(),
      adsSampleDataSheet.getLastColumn() - objectsColumnIndex + 1
    )
    .clearContent();

  for (const sheetName of [
    objectsAnalysisSheetName,
    labelsAnalysisSheetName,
    wordsAnalysisSheetName,
  ]) {
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (sheet) {
      spreadsheet.deleteSheet(sheet);
    }
  }
}

/**
 * Delete the property that holds the user's Google Vision API key.
 */
function resetAPIKey() {
  PropertiesService.getUserProperties().deleteProperty(apiKeyPropertyName);
}

/**
 * Add script options to Sheets menu.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🚗 Car Ads Analysis Demo')
    .addItem('Authorize script', 'authorize')
    .addSeparator()
    .addItem("Analyse images' performance", 'analyseImagesPerformance')
    .addSeparator()
    .addItem('Reset demo data', 'resetDemoData')
    .addItem('Reset API key', 'resetAPIKey')
    .addToUi();
}

/**
 * Get data about the performance of images used in ads.
 */
function analyseImagesPerformance() {
  analyseAdsImages();
  outputImagesPerformanceAnalyses();
}
