NeuroNote - Todo Application

A React Native Todo application built for the Nexeed internship assignment, featuring user authentication and full CRUD functionality.

Features Implemented
Core Requirements

User Authentication: Complete login/signup system with email and password

Task Management: View, add, complete, edit, and delete tasks

Data Persistence: Local storage using AsyncStorage

Edit Functionality: Edit existing tasks through a modal interface

Search: Filter tasks using the search bar

Technical Implementation
Framework & Tools

React Native with Expo for cross-platform development

TypeScript for type safety and improved development experience

Expo Router for navigation

Database

AsyncStorage: Used for local data persistence, as required by the assignment specifications

State Management

React Hooks (useState, useEffect) for managing authentication and task states efficiently

UI Components

Custom components with consistent styling

Modal interface for editing tasks

Responsive design suitable for multiple screen sizes

Installation & Setup
Prerequisites

Node.js (version 14 or higher)

npm or yarn package manager

Expo Go app on a mobile device (for testing)

Usage Guide

Create an Account: Use the signup form to register

Login: Access your account using your credentials

Add Tasks: Use the input field at the bottom to add new tasks

Manage Tasks:

Mark tasks as complete

Edit tasks using the pencil icon

Delete tasks using the trash icon

Search: Use the search bar to quickly find specific tasks

App Demonstration

A demonstration video of the application is available here:
Watch the demo

Technical Decisions
Why Expo?

Expo was selected for its streamlined development workflow, excellent documentation, and compatibility with both iOS and Android platforms. It allows faster development without requiring native code configuration.

Why AsyncStorage?

The assignment required local storage. AsyncStorage is the recommended solution for simple, persistent key-value storage in React Native. It provides reliable asynchronous storage suitable for handling user-specific task data.

Component Structure

The application follows a modular component structure with clear separation of concerns.

The main App component manages authentication state and task logic.

TodoItems is a dedicated component for displaying and interacting with individual tasks, improving reusability and code organization.
