# irres-update-locations

This repository contains a GitHub Action that updates Botpress tables with data from external APIs.

## Setup

1. In your GitHub repository settings, go to Secrets and Variables > Actions.
2. Add the following secrets:
   - `BOTPRESS_BOT_ID`: `d7c63fad-455b-48f2-b5a9-e1aa70b0a11e`
   - `BOTPRESS_TOKEN`: `bp_pat_3656eEvEX2jcOYqb6GahD31IgAa4jeyb5zzV`

## Workflow

The GitHub Action runs daily at 00:00 Belgium time (23:00 UTC) and:
- Fetches locations from `https://irres-location-scraper.onrender.com/api/locations`
  - Parses the response: expects `data.locations` as an array of location strings
  - Adds each location as a row in `LocationsFilter` table with column `Locations`
- Fetches office images from `https://irres-location-scraper.onrender.com/api/office-images`
  - Parses the response: expects `data` as an object of {name: url}
  - Adds each image as a row in `OfficesImages` table with column `Image` containing {name, url}
- Clears existing data in both tables before adding new entries

## Manual Trigger

You can also trigger the workflow manually from the Actions tab in GitHub.