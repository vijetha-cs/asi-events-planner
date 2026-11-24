# ASI Events Planner

A student focused event discovery app inspired by Associated Students, Inc. (ASI) at CSULB. The project has a Vercel-hosted React demo and an optional PHP/WordPress backend that can be run locally for free.

**Live frontend:** [Open the ASI Events Planner](https://asi-events-planner.vercel.app/)

## Features

- Search events and filter by category, month, and location
- Save events and view “My Events”
- Register for or cancel an event
- Create, edit, publish, unpublish, and delete events in the organizer dashboard
- Add event descriptions, images, image descriptions, accessibility notes, and registration limits
- Use WordPress accounts and roles to control organizer actions when the API is connected
- Store events and registrations in a WordPress MySQL database in API mode
- Responsive layout, visible keyboard focus, a skip link, reduced motion support, and keyboard-operable event details dialog
- Optional GitHub Actions workflow to build the frontend when code is pushed

## Technology

- React, JavaScript, HTML, CSS, Tailwind CSS, and Vite
- PHP WordPress plugin and WordPress REST API
- MySQL through the WordPress installation
- GitHub, GitHub Actions, and VS Code
- Vercel for the public frontend

See [`CHANGELOG.md`](CHANGELOG.md) for project updates.

## Demo and backend modes

The deployed Vercel site runs in demo mode unless `VITE_WP_API_URL` is configured. Demo event edits, saved events, and registrations are stored in that browser’s localStorage and do not sync between users.

The backend source is in [`backend/wordpress/asi-events-planner/`](backend/wordpress/asi-events-planner/). It provides a custom event type, a registration database table, WordPress REST API routes, and an **ASI Event Organizer** role. The backend is source code in this repository; it is not hosted by Vercel. The local WordPress setup below is free. To connect a publicly deployed frontend to a public WordPress site later, you would need to host WordPress separately and configure its API origin and authentication.

## Run the React frontend

1. Install Node.js.
2. Clone this repository and open the project folder in a terminal.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start Vite:

   ```bash
   npm run dev
   ```

5. Open the local URL shown in the terminal.

Create a production build with `npm run build`. Run the configured linter with `npm run lint`.

## Run the WordPress backend locally

The backend requires a local WordPress site with PHP and MySQL. No paid WordPress hosting is required for local development.

1. Set up WordPress locally using a PHP/MySQL development environment.
2. Copy `backend/wordpress/asi-events-planner/` into the local site’s `wp-content/plugins/` folder.
3. In `wp-config.php`, add the Vite origin (use the exact port shown by Vite):

   ```php
   define('ASI_EVENTS_ALLOWED_ORIGIN', 'http://localhost:5173');
   ```

4. In WordPress Admin, activate **ASI Events Planner API**. Activation creates the registration table and the **ASI Event Organizer** role.
5. Create a WordPress user and assign **ASI Event Organizer**. Students who register for events need WordPress accounts with permission to log in, such as the Subscriber role.
6. In the React project, create `.env.local` from `.env.example` and set the API URL. Replace `your-wordpress-folder` with the path to the local WordPress site:

   ```env
   VITE_WP_API_URL=http://localhost/your-wordpress-folder/wp-json/asi-events/v1
   ```

7. Restart the Vite server after changing `.env.local`. Sign in through WordPress, then use the app’s Organizer view. The API mode reads and writes events and registrations in WordPress.

The WordPress site must allow the exact frontend origin in `ASI_EVENTS_ALLOWED_ORIGIN`. Do not put WordPress passwords, application passwords, or private credentials in `VITE_` variables or commit them to GitHub. This portfolio integration is intended for local learning; public cross-site authentication requires additional deployment configuration.

## REST API routes

Base path: `/wp-json/asi-events/v1`

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/session` | Public | Returns sign-in state and a REST nonce for the current WordPress browser session |
| `GET` | `/events` | Public | Lists published events; organizers can also see drafts |
| `POST` | `/events` | Organizer | Creates an event |
| `POST` | `/events/{id}` | Organizer | Updates an event or its draft/published status |
| `DELETE` | `/events/{id}` | Organizer | Deletes an event |
| `GET` | `/my-registrations` | Signed-in user | Lists the current user’s registered event IDs |
| `POST` | `/events/{id}/register` | Signed-in user | Registers the current user, subject to the event limit |
| `POST` | `/events/{id}/cancel` | Signed-in user | Cancels the current user’s registration |

## Data and image notes

The built-in sample events and stock photos are portfolio examples, not official event photographs. Verify event details against ASI’s official listings before relying on them. Organizer images are supplied as image URLs; the alternative text field is saved with the event and used by screen readers.

## Accessibility and quality notes

The project includes keyboard focus styles, a skip link, reduced motion support, semantic labels, lazy-loaded images, and keyboard controls for the event dialog. These are implementation features, not a claim of ADA or Section 508 certification. Before presenting it as fully accessible, manually check it with a keyboard, screen reader, contrast checker, and browser testing tools.
