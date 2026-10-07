# Site Operations Dashboard

A full-stack Site Operations Dashboard built to manage sites and installation records with a React frontend, Node.js/Express backend, and PostgreSQL database.

## Tech Stack

### Frontend

- React.js
- TypeScript
- Vite
- Axios
- React Hooks
- Responsive CSS

### Backend

- Node.js
- Express.js
- TypeScript
- REST APIs
- Request logging
- Input validation
- Error handling

### Database

- PostgreSQL
- SQL
- Relational database design
- JOINs
- Aggregations
- Indexing

## Features

### Dashboard

- Total sites
- Active sites
- Planned sites
- Completed sites
- Total installations
- Pending installations
- In-progress installations
- Completed installations

### Site Management

- Create site
- View sites
- Search sites
- Filter sites by status
- Update site
- Delete site

### Installation Management

- Create installation
- View installations
- Search installations
- Filter installations by status
- Update installation
- Delete installation

### Validation

- Required field validation
- Status validation
- Numeric ID validation
- Site existence validation
- User existence validation
- Date format validation
- Completion date validation

## Database Structure

The application uses three main tables:

```text
Users
  |
  | created_by / assigned_to
  |
Sites
  |
  | site_id
  |
Installations
```
