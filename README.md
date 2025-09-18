# CODI Marketing Assistant - Complete Setup Guide

## 🎯 What This Is
A comprehensive marketing analytics and AI-powered insights system that processes data from Google Analytics, Google Ads, and other marketing platforms to generate actionable insights and reports.

---

## 🚀 Complete Setup (Follow Each Step)

### **Step 1: Install Required Software**

#### 1.1 Install Git
- Go to [git-scm.com](https://git-scm.com/)
- Download and install Git for Windows
- **Restart your computer** after installation

#### 1.2 Install Node.js
- Go to [nodejs.org](https://nodejs.org/)
- Download the **LTS version** (recommended)
- Run the installer and follow the prompts
- **Restart your computer** after installation

#### 1.3 Install Docker Desktop
- Go to [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
- Download Docker Desktop for Windows
- Run the installer and follow the prompts
- **Restart your computer** after installation
- Start Docker Desktop and wait for it to fully load (whale icon in system tray)

### **Step 2: Get the Project**

#### 2.1 Clone the Repository
```bash
# Open Command Prompt or PowerShell
# Navigate to where you want the project (e.g., Desktop)
cd C:\Users\YourName\Desktop

# Clone the project
git clone [YOUR_REPOSITORY_URL]
cd PS-2507
```

#### 2.2 Alternative: Download ZIP
- Download the project ZIP file
- Extract it to your Desktop
- Open Command Prompt/PowerShell in that folder

### **Step 3: Start the Database**

#### 3.1 One-Click Database Start
- **Double-click** `start-database.bat`
- Wait for "Database is ready!" message
- **Keep this window open** until you see the success message

#### 3.2 If the batch file doesn't work:
```bash
# In Command Prompt/PowerShell, type:
docker-compose up -d
```

### **Step 4: Set Up Environment**

#### 4.1 Copy Environment File
```bash
# In Command Prompt/PowerShell, type:
copy env.example .env
```

#### 4.2 Verify the .env file contains:
```
DATABASE_URL="postgresql://postgres:testpass123@localhost:6500/mydb?schema=public"
```

### **Step 5: Install Dependencies & Start**

#### 5.1 Install Node.js packages
```bash
npm install
```

#### 5.2 Set up the database
```bash
npm run generate
npx prisma migrate dev
npm run seed
```

#### 5.3 Start the application
```bash
npm run dev
```

#### 5.4 Open your browser
- Go to [http://localhost:3000](http://localhost:3000)
- You should see the CODI Marketing Assistant!

---

## ✅ What You Should See

- **Database running** in Docker Desktop (green container)
- **Website working** at localhost:3000
- **Login page** with CODI branding
- **Marketing dashboard** with campaign analytics
- **Blue theme** throughout the system

---

## 🔑 Default Login Credentials

- **Admin User**: admin@codi.com / admin12345
- **Marketer User**: marketer@codi.com / marketer123

---

## 🆘 If Something Goes Wrong

### **Database Issues:**
1. **Open Docker Desktop**
2. **Go to "Containers" tab**
3. **Look for "postgres-codi"**
4. **Click the three dots (...) → "Restart"**

### **Port Issues:**
1. **Change port in `docker-compose.yml`** from 6500 to 6501
2. **Update `.env` file** to use port 6501
3. **Restart database**

### **Node.js Issues:**
1. **Restart Command Prompt/PowerShell**
2. **Run `node --version`** to check installation
3. **Restart your computer** if needed

### **Git Issues:**
1. **Restart Command Prompt/PowerShell**
2. **Run `git --version`** to check installation
3. **Restart your computer** if needed

---

## 📱 Quick Commands Reference

```bash
# Start database
start-database.bat

# Install packages
npm install

# Set up database
npm run generate
npx prisma migrate dev

# Seed with sample data
npm run seed

# Start app
npm run dev

# Stop database
docker-compose down
```

---

## 🎯 Success Checklist

- [ ] Git installed and working
- [ ] Node.js installed and working  
- [ ] Docker Desktop running
- [ ] Database started successfully
- [ ] .env file created
- [ ] Dependencies installed
- [ ] Database migrated
- [ ] Sample data seeded
- [ ] App running at localhost:3000
- [ ] Can see login page with blue theme
- [ ] Can log in with admin credentials

---

## 📊 System Features

**Marketing Analytics:**
- Google Analytics integration
- Campaign performance metrics
- AI-powered insights generation
- Custom dashboard creation
- Automated reporting

**Data Management:**
- Multi-platform data import
- Real-time data synchronization
- Historical data analysis
- Custom metric creation
- Audience segmentation

**AI Capabilities:**
- Performance trend analysis
- Campaign optimization suggestions
- Audience behavior insights
- Budget optimization recommendations
- Competitive analysis

---

## 📞 Need Help?

**Common Issues:**
- **"Docker is not running"** → Start Docker Desktop
- **"Port already in use"** → Change port in docker-compose.yml
- **"Command not found"** → Restart Command Prompt after installing software
- **"Database connection failed"** → Wait 15 seconds for database to start

**Your database will be ready in about 15 seconds!** 🚀

---

## 🔄 Daily Use

**To start working:**
1. Start Docker Desktop
2. Double-click `start-database.bat`
3. Run `npm run dev`
4. Open localhost:3000

**To stop working:**
1. Press `Ctrl+C` in the terminal
2. Run `docker-compose down`
3. Close Docker Desktop
