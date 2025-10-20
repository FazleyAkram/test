# CODi Marketing Review Service - Complete Guide

### What This Is
A comprehensive marketing analytics and AI-powered insights system that processes data from Google Analytics to generate actionable insights and reports.

---

### Minimum Requirements/Dependencies



---

### Explanation of Critical Files/Folders (for future developers)

#### .env
- Contains API keys, credentials and other environment variables that can't be kept in the codebase for security.
- See setup for what to add to this file.

#### package.json
- Includes project dependencies and scripts not included in the codebase.
- If the dependencies listed in this file aren't installed, the system will not run correctly.

#### prisma/schema.prisma
- This file includes the PostgreSQL database schema with all models and enums.

#### public
- This folder contains static graphics/images used across the system.
- It should not contain any code.

#### src/app/api
- This folder contains the backend routes for GET and POST requests.
- This folder is further broken done into subfolders for different backend features.

#### src/app
- This folder contains the main user facing pages such as the landing page, dashboard, analysis etc.
- Not all components of these files are included here as some components are re-used. These can be in found in **src/components**.
- Analysis/summary page and view reports page are under **src/app/dashboard**.

#### src/components
- This folder contains re-usable UI components used multiple times by pages in **src/app**.

#### src/lib
- This folder contains re-usable libraries used by backend routes in **src/app/api**.

---

## Setup (Follow each step)

### **Step 1: Server Setup**



### **Step 2: Database Setup**

#### 2.1 Create a Neon Account & Project
- Go to https://neon.tech/
- Sign up using GitHub, Google or email
- Click **New Project**
- Choose:
    - **Project name** (Anything)
    - **Region** (Pick closest region to you)
    - **PostgreSQL version** (default is fine)
- Click **Create Project** - Neon will automatically create:
    - A database
    - A default branch
    - A user

#### 2.2 Get the database connection URL
- Once the project has been created, Neon will show you a **Connection Details** panel.
- Select **Connection String** -> **psql** or **General**
- Copy the URL. It should look something like:
```
postgresql://neondb_owner:AbC123XYZ@ep-cool-name-12345.ap-southeast-2.aws.neon.tech/neondb?sslmode=require
```

#### 2.3 Add URL to environment
- Add to the .env file and **ensure that quotes are included**:
```
DATABASE_URL="postgresql://neondb_owner:AbC123XYZ@ep-cool-name-12345.ap-southeast-2.aws.neon.tech/neondb?sslmode=require"
```

### **Step 3: Create a Gmail and generate an App Password (for emailing)**

#### 3.1 Create a new Gmail account
- Go to https://accounts.google.com/signup
- Fill in name, username, password → follow prompts until the inbox opens

#### 3.2 Turn on 2‑Step Verification (MUST BE DONE) (required for App Password)
- Visit https://myaccount.google.com/security
- Under **How you sign in to Google** → click **2‑Step Verification**
- Find **2‑Step Verification** → click it → **Get Started**
- Follow prompts (approve on your phone or use SMS). Make sure it shows **On**

#### 3.3 Generate a Gmail App Password
- Stay in https://myaccount.google.com/security
- Under **2‑Step Verification** page, scroll to **App passwords**
- Click **App passwords** (you may need to sign in again)
- In **Select app**, choose **Mail**
- In **Select device**, choose **Other (Custom name)** and name it (e.g., **CODi App**)
- Click **Generate**
- Copy the 16‑character App Password (no spaces). You won’t see it again

#### 3.4 Add credentials to environment
- **Email user**: your full Gmail address (e.g. yourname@gmail.com)
- **App password**: the 16‑character password from step 3
- Add to the .env file, replacing the username and password with above:
```
GMAIL_USER=yourname@gmail.com
GMAIL_APP_PASSWORD=password
```

### **Step 4: OpenAI Setup**

#### 4.1 Add OpenAI API key to environment
- Add OpenAI API key to .env file, replacing key with the actual API key:
```
OPENAI_API_KEY=key
```
- It should end looking similar to below, but the series of 0s are actually a bunch of random characters:
```
OPENAI_API_KEY=sk-EXAMPLE-00000000000000000000000000000000
```

### **Step 5: OAuth Setup**



### **Step 6: GA Account Setup**



### **Step 7: Login with seed user credentials**
- **Admin User**: admin@codi.com / admin12345
- **Marketer User**: marketer@codi.com / marketer123

### **Step 8: Use platform**
