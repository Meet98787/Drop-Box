# Dropbox - Employee Feedback and Complaint Management System

## Overview
Dropbox is an employee feedback and complaint management system built using the MERN stack (MongoDB, Express, React, Node.js). The platform allows employees to submit complaints and suggestions to the company. The CEO, who acts as the administrator, can view all complaints and suggestions but will not be able to see which employee submitted them, ensuring privacy and confidentiality.

## Features
- **Employee Registration**: Employees can register and log in to the system.
- **Submit Complaints & Suggestions**: Employees can create complaints or suggestions for the company.
- **Admin View**: The CEO (Admin) can view all complaints and suggestions but without identifying which employee submitted them.
- **Confidentiality**: The system ensures that employee details remain anonymous when complaints or suggestions are viewed by the admin.

## Tech Stack
- **Frontend**: React
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT for secure login

## Installation
### Prerequisites
Make sure you have the following installed:
- Node.js (>= 14.x)
- MongoDB

### Steps
1. Clone this repository:
   ```bash
   git clone https://github.com/meet98787/dropbox.git

2.Navigate to the project directory:
```basu
  cd dropbox
3.Install dependencies for both frontend and backend:
```basu
  cd client && npm install
  cd ../server && npm install

4.Set up environment variables:

5.Start the backend server:
```basu
cd server
npm run dev

6.Start the frontend:
```basu
cd client
npm start
