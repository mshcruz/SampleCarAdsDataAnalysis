# Sample Car Ads Data Analysis Demo

📽️ Demo video (2 min): https://www.loom.com/share/a438adb81c604977824f1d1ae2f48f6b

This project aims to analyze the impact of features (objects, actions, words) found in creatives (ads images) and help guide the creation of new ads based on past performance.
It is based on the presentation [“Marketing and Creative Insights from Unstructured Data: Cloud ML APIs (Cloud Next '19)”](https://www.youtube.com/watch?v=78kM5vyN4nk), but it uses simpler tools that could allow quicker proofs-of-concept and easier adoption by SMBs.

## How to Use

1. Copy the [template spreadsheet](https://docs.google.com/spreadsheets/d/1KZ0W8KH-MZGry0-10BWzzYUBwr0DxeCcEowf5uXZDHY/copy).
2. Use the sheet "Ads Sample Data" to specify the URL of the creative and its performance
3. Click on the menu "Car Ads Analysis Demo" > "Authorize Script" to give permission for the script to run
4. Click on the menu "Car Ads Analysis Demo" > "Analyze image's performance"
   - On the first run, the script will ask for the [Google Vision API](https://cloud.google.com/vision/) key
5. The script will generate new sheets with the performance data breakdown by objects, labels and words found in the images

## Merits

- Use of simple tools
- Analysis of creatives used in different ads platforms (😅)

## Points of Attention

- Bias due to past trends
  - Consider trend monitoring (e.g., Twitter) and the combination of features
- Limited scalability
  - Can scale with Dataflow, BigQuery, Data Studio (as in the original demo)

## Possible Extensions

- Consider combinations of features (i.e., multiple labels, objects) for more accuracy
- Creative evaluation tool
  - Assign a score to a creative after comparing its features and features that generated high Impressions/CTR/Clicks in the past
  - Suggest what features should be included in the creative (e.g., “natural environment”, “people” and “urban design”)

## Data Sources

- [Google Data Studio’s “Ads Sample Data”](https://datastudio.google.com/c/u/0/reporting/0B_U5RNpwhcE6ckdmZEJ0ZDJXUnM/preview)
- [Design Your Way’s creative prints collection](https://www.designyourway.net/blog/inspiration/70-creative-print-ads-from-the-automotive-industry/)

## Tools and Systems

- Google Sheets ([template spreadsheet](https://docs.google.com/spreadsheets/d/1KZ0W8KH-MZGry0-10BWzzYUBwr0DxeCcEowf5uXZDHY/))
- Google Apps Script ([source](https://github.com/mshcruz/SampleCarAdsDataAnalysis))
- Google Vision API
