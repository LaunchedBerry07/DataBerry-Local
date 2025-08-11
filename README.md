# DataBerry - Gmail Finance Manager

A sophisticated Gmail Finance Manager application designed to serve as a centralized hub for automated extraction, categorization, and management of financial documents from Gmail accounts. Built for accounting technicians, administrative assistants, and low-code developers to streamline financial document workflow management.

## 🌟 Features

- **Email Management**: Automated processing and categorization of financial emails
- **Advanced Filtering**: Multi-conditional rules for complex email queries
- **Data Export**: CSV export functionality respecting all active filters
- **Gmail Sync**: Integration with Google Apps Script for automated email processing
- **Label Management**: Custom categorization system for organizing emails
- **Contact Management**: Centralized contact database for financial correspondents
- **Dashboard Analytics**: Real-time metrics and visualizations
- **Session Authentication**: Secure PostgreSQL-backed user sessions

## 🛠 Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: Session-based with PostgreSQL storage
- **State Management**: TanStack Query
- **Deployment**: Google Cloud Run with Google Cloud Build CI/CD

## 🚀 Google Cloud Deployment Instructions

### Step 1: Google Cloud Project Setup

1.  **Create a Project**: Ensure you have a Google Cloud Platform project.
2.  **Enable APIs**: In the GCP Console, enable the following APIs:
    * Cloud Build API
    * Cloud Run Admin API
    * Artifact Registry API
    * Secret Manager API
    * Cloud SQL Admin API
3.  **Configure gcloud CLI**: Authenticate your local environment by running `gcloud auth login` and `gcloud config set project [YOUR_PROJECT_ID]`.

### Step 2: Create PostgreSQL Database on Google Cloud SQL

1.  Navigate to **Cloud SQL** in the GCP Console.
2.  Click **"Create Instance"** and select **PostgreSQL**.
3.  Provide an instance ID (e.g., `databerry-db`), set a strong password, and choose your desired region.
4.  Once created, navigate to the instance details, go to the "Databases" tab, and create a new database (e.g., `databerry`).
5.  **Important**: Note the **Connection name** (e.g., `your-project:us-central1:databerry-db`). You will need this for the database URL.

### Step 3: Configure Secret Manager for Environment Variables

1.  Navigate to **Secret Manager** in the GCP Console.
2.  Create the following secrets, storing their respective values:
    * `DATABASE_URL`: `postgresql://[USER]:[PASSWORD]@/[DATABASE_NAME]?host=/cloudsql/[CONNECTION_NAME]`
    * `SESSION_SECRET`: Generate a strong, random string of at least 32 characters.
    * `GOOGLE_APPS_SCRIPT_URL`: The deployed URL from your Apps Script project.
    * `CORS_ORIGIN`: The URL of your deployed Cloud Run service (you may need to update this after the first deployment).
3.  Grant the **Cloud Build service account** (`[PROJECT_NUMBER]@cloudbuild.gserviceaccount.com`) the **"Secret Manager Secret Accessor"** role in IAM settings.

### Step 4: Configure Cloud Build Trigger

1.  Navigate to **Cloud Build** in the GCP Console and go to the "Triggers" tab.
2.  Connect your Git repository (GitHub, etc.).
3.  Create a new trigger:
    * **Name**: `deploy-databerry-production`
    * **Event**: Push to a branch
    * **Branch**: `^main$` (or your primary branch)
    * **Configuration**: Cloud Build configuration file (`cloudbuild.yaml`)
    * **Location**: Repository

### Step 5: Initiate Deployment

1.  Push a commit to the branch you configured in the trigger.