# Expense-tracker
## Description & Problem Statement

Managing daily expenses manually can be difficult, unorganized, and error-prone. Many people struggle to track where their money goes, leading to poor budgeting and financial planning.

This Expense Tracker Application is designed to solve this problem by providing a simple and user-friendly platform to track expenses, manage budgets, and analyze spending patterns. It helps users maintain financial discipline by organizing expenses into categories and giving a clear overview through a dashboard.

The application uses a Spring Boot backend with REST APIs to handle data and provide responses, making it scalable and easy to integrate with frontend applications.
## Features
- Dashboard:
View total spent amount
Check remaining budget
Track today’s expenses
Monitor total transactions
Visual representation of spending trends
- Categories Management:
Create and manage expense categories like:
Food & Dining
Transportation
Shopping
Bills & Utilities
Health & Fitness
Set budget limits for each category
View budget usage and remaining amount
- Expense Management:
Add new expenses
View all expenses
Track expenses by category
- Settings & Profile:
Update user profile information
Export expense data as JSON
Clear all data (reset functionality)
- CRUD Operations:
Create → Add expenses and categories
Read → View expenses, dashboard data, and categories
Update → Edit categories and data
Delete → Remove categories or clear all data
- REST API:
Backend APIs for handling requests and responses
Example endpoint: /api/status

## Tech Stack
- Backend: Java, Spring Boot
- Build Tool: Maven
- API: RESTful APIs
- Data Format: JSON
- Testing: JUnit

## Setup & Installation
**Prerequisites:**
- Java 17 or higher
- Maven installed
- IDE (IntelliJ / Eclipse / VS Code)
**Steps to Run:**
1.Clone the repository:
      git clone https://github.com/your-username/expense-tracker.git
2.Navigate to project folder:
      cd expense-tracker
3.Run the application:
- Open in IDE
- Run DemoApplication.java
4.Access the application:
- Backend runs on:
http://localhost:8080
- Test API:
http://localhost:8080/api/status
