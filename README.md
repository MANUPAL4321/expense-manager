# 💸 Expense Manager (HCI Project)

A modern, full-stack financial tracking application designed to help users analyze, record, and optimize their spending. Built with a sleek Glassmorphism UI, a React frontend, and a robust Spring Boot backend.

**This project was developed as a Human-Computer Interaction (HCI) Group Project.**

### 👥 Project Members
*   **Manu Pal**
*   **Ritik Kumar**
*   **Sahil Kumar**

---

## 🎨 HCI Design Principles & User-Centered Design (UCD)
This application was engineered with strict adherence to core Human-Computer Interaction design principles to ensure a seamless, accessible, and intuitive user experience.

### 1. User-Centered Design (UCD)
The system was designed around the actual needs of users managing personal finances. Navigation was heavily optimized—for example, analysis and reporting were merged into single, highly cohesive views to reduce cognitive load and click fatigue. 

### 2. Visibility of System Status (Feedback)
Users are always kept informed of what the system is doing.
*   **Loading Spinners:** Displayed immediately on buttons (like "Add Expense") while backend requests are processing.
*   **Toast Notifications:** Clear, color-coded popups (Success/Error) appear at the top of the screen to confirm actions like saving or updating a transaction.

### 3. Error Prevention
The interface is designed to prevent user errors before they happen.
*   **Smart Form Validation:** Prevents the submission of empty titles, negative amounts, or missing categories.
*   **Constrained Inputs:** The Date Picker restricts users from selecting future dates for past transactions, and the country selector defaults intelligently.

### 4. Flexibility and Efficiency of Use
The interface caters to both novice and power users by speeding up frequent actions.
*   **Category Auto-completion:** Instead of scrolling through long lists, users can just start typing, and the custom dropdown instantly filters relevant categories.
*   **Dynamic Contexts:** The form dynamically changes labels ("Add Income" vs "Add Expense") and colors based on the user's current selection, minimizing confusion.

### 5. Aesthetic and Minimalist Design
*   **Glassmorphism UI:** The application uses a modern dark-mode aesthetic with frosted glass effects. This isn't just for looks; it establishes a clear visual hierarchy, keeping the user's focus strictly on important data and charts without visual clutter.

### 6. Help Users Recognize, Diagnose, and Recover from Errors
*   **Clear Error States:** If a form field is missed, it highlights in red with a clear, readable error message directly below the input field.
*   **Easy Recovery:** If a user makes a mistake logging a transaction, they can easily locate it in the "History" tab and edit or delete it without having to start over.

### 7. Match Between System and Real World
*   **Familiar Metaphors:** The app uses universally understood financial colors (Green for Income, Red for Expense) and familiar icons (Pie charts, Bar charts, Wallets) so users instantly understand the interface without a manual.

---

## ✨ Features

- **Dashboard**: A quick overview of your net balance, recent transactions, and simple top-level stats.
- **Add Transactions**: Quickly log income or expenses with smart category auto-completion.
- **Visual Analytics**: Interactive trend graphs (Area, Line, Bar) and Category breakdowns (Pie chart) using Recharts.
- **Transaction History**: A dedicated view for all your past logs featuring date-range filters (Yearly, Monthly, Daily, Custom).
- **Data Export**: One-click download of filtered transaction data into cleanly formatted CSV files (UTF-8 compatible).
- **User Authentication**: Secure JWT-based login and registration.
- **AI Integration**: Prepared for Groq/OpenAI features to provide smart financial insights.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Styling**: Vanilla CSS (Modern Dark Mode / Glassmorphism)
- **Date Management**: React-Datepicker

### Backend
- **Framework**: Java Spring Boot
- **Database**: MySQL
- **ORM**: Hibernate / Spring Data JPA
- **Security**: Spring Security & JWT (JSON Web Tokens)
- **AI Engine**: Spring AI (Configured for Groq API)

---

## 🚀 Getting Started (Local Setup)

To run this project locally, follow these steps:

### Prerequisites
1. **Node.js** (v14 or higher) and **npm** installed.
2. **Java JDK 17+** installed.
3. **MySQL Server** installed and running on port `3306`.
4. **Git** for cloning the repository.

### 1. Clone the Repository
```bash
git clone https://github.com/MANUPAL4321/expense-manager.git
cd expense-manager
```

### 2. Database Setup

The backend is configured to use **MySQL** by default, but it can easily be switched to **PostgreSQL**. Open `expense-manager-backend/src/main/resources/application.properties` and paste the snippet that matches your chosen database:

#### Option A: MySQL (Default)
1. Ensure MySQL is running on port `3306`.
2. The application will auto-create the database `expense_manager_db` on startup.
3. Replace the database configuration block with:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/expense_manager_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=your_mysql_password
   spring.jpa.hibernate.ddl-auto=update
   ```

#### Option B: PostgreSQL
1. Ensure PostgreSQL is running on port `5432`.
2. You must create a database named `expense_manager_db` manually in pgAdmin or your terminal first.
3. Replace the database configuration block with:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/expense_manager_db
   spring.datasource.username=postgres
   spring.datasource.password=your_postgres_password
   spring.jpa.hibernate.ddl-auto=update
   ```
4. **Important:** If you switch to PostgreSQL, you must open `expense-manager-backend/pom.xml` and add the PostgreSQL driver dependency:
   ```xml
   <dependency>
       <groupId>org.postgresql</groupId>
       <artifactId>postgresql</artifactId>
       <scope>runtime</scope>
   </dependency>
   ```

### 3. Environment Variables (Backend)
For the AI features to work, you need to provide a Groq API Key as an environment variable. 
In your terminal, set the variable before starting the backend:

**Windows (PowerShell):**
```powershell
$env:GROQ_API_KEY="your_groq_api_key_here"
```
**Mac/Linux:**
```bash
export GROQ_API_KEY="your_groq_api_key_here"
```
*(Note: If you don't care about the AI features right now, you can mock this or leave it empty, though Spring AI might throw warnings).*

### 4. Run the Backend (Spring Boot)
Open a terminal window and navigate to the backend directory:
```bash
cd expense-manager-backend
```
Run the application using the Maven wrapper:
**Windows:**
```bash
./mvnw.cmd spring-boot:run
```
**Mac/Linux:**
```bash
./mvnw spring-boot:run
```
*The backend server will start on `http://localhost:8080`.*

### 5. Run the Frontend (React)
Open a **new** terminal window and navigate to the frontend directory:
```bash
cd expense-manager-frontend
```
Install the node dependencies:
```bash
npm install
```
Start the development server:
```bash
npm start
```
*The frontend application will start and automatically open your browser to `http://localhost:3000`.*

---

## ⚙️ Application Configuration Details

### Currency
The default currency across the platform is set to **Rupee (₹)**.

---

## 🤝 Feedback & Collaboration

We would love to hear your thoughts on our HCI Project! If you have any feedback regarding the user interface, accessibility, or overall user experience, please feel free to reach out to any of the team members. 

If you are a developer looking to contribute:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request!

We welcome all suggestions to make this project even better.

---
*Created for the Human-Computer Interaction (HCI) coursework by Manu Pal, Ritik Kumar, and Sahil Kumar.*
