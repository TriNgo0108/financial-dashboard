# Daily Financial Dashboard

A serverless daily financial dashboard built with React (GitHub Pages) and Python (GitHub Actions).

## Overview

- **ETL**: Runs daily via GitHub Actions (`.github/workflows/daily-etl.yml`). Aggregates data from PostgreSQL and saves JSON to `public/data/`.
- **Frontend**: React SPA hosted on GitHub Pages. Fetches the JSON data at runtime.
- **Data Source**: PostgreSQL (Credentials stored in GitHub Secrets).

## Setup

### Prerequisites
- Node.js & npm
- Python 3.9+
- PostgreSQL database

### Local Development

1. **Install Dependencies**
   ```bash
   # Python
   pip install -r requirements.txt
   
   # Node
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file for local ETL testing (do not commit this):
   ```
   DB_HOST=localhost
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=password
   ```

3. **Run ETL Locally**
   ```bash
   python scripts/etl_daily.py
   ```
   This will generate `public/data/monthly_summary.json` and `public/data/kpi_summary.json`.

4. **Run React App**
   ```bash
   npm run dev
   ```

### Deployment

The project is configured to deploy automatically to GitHub Pages.

1. **GitHub Secrets**: Set the following repository secrets:
    - `DB_HOST`
    - `DB_NAME`
    - `DB_USER`
    - `DB_PASSWORD`

2. **GitHub Pages**: Go to Settings -> Pages.
    - Build and deployment source: **GitHub Actions** (if using the workflow to deploy) OR **Deploy from a branch** (if the workflow pushes to `gh-pages` branch).
    - The provided workflow uses `peaceiris/actions-gh-pages` which pushes to `gh-pages` branch. ensure the "Deploy from a branch" source is selected and set to `gh-pages` / `root`.

## Project Structure

- `scripts/`: Python ETL scripts
- `public/data/`: JSON output destination (served as static assets)
- `src/`: React source code
- `.github/workflows/`: Automation workflows
