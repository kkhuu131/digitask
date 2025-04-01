# Digitask

A productivity app where users raise a virtual pet whose health and evolution are directly tied to the completion of user-defined tasks.

## Features

- User authentication (sign up, login, password reset)
- Task management (create, edit, delete, complete, view daily and upcoming tasks)
- Virtual pet that evolves based on task completion
- Pet health and happiness affected by task completion/failure
- Task categorization and filtering
- Streak tracking for consistent task completion
- Responsive design for mobile and desktop use
- Dark/light mode theme support

## Tech Stack

- React with TypeScript
- Tailwind CSS for styling
- Zustand for state management
- Supabase for authentication and database
- React Router for navigation
- Vite for build tooling and development server

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/kkhuu/digitask.git
   cd digitask
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials

   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up the Supabase database

   - Create a new Supabase project
   - Run the SQL from `supabase/schema.sql` in the SQL editor

5. Start the development server
   ```bash
   npm run dev
   ```

## Usage

1. Register a new account
2. Create your pet and customize its appearance
3. Add tasks to complete with due dates and categories
4. Complete tasks to keep your pet healthy and help it evolve
5. Track your productivity streaks and pet's growth over time

## Project Structure
