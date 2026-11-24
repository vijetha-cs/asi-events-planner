# ASI Events Planner API (WordPress plugin)

This plugin adds an `ASI Events` post type, event metadata, organizer capabilities, registration storage, and REST API routes for the React portfolio app. It is source code only; Vercel does not run PHP or MySQL.

## Setup

1. Install WordPress in a local PHP/MySQL environment.
2. Copy this `asi-events-planner` folder to `wp-content/plugins/`.
3. Add the exact frontend origin to `wp-config.php` before the “stop editing” line. For Vite's usual local address:

   ```php
   define('ASI_EVENTS_ALLOWED_ORIGIN', 'http://localhost:5173');
   ```

4. Activate **ASI Events Planner API** in WordPress Admin. Activation creates the registrations table and the `ASI Event Organizer` role.
5. Create an organizer user and assign that role. Create student accounts with a role allowed to log in, such as Subscriber. The plugin never stores passwords; WordPress handles sign-in.
6. Add `VITE_WP_API_URL=http://localhost/your-wordpress-folder/wp-json/asi-events/v1` to the React app's `.env.local` and restart Vite.

The API uses WordPress cookie authentication and REST nonces for changes. Do not expose a WordPress password or application password in React code or a Vite environment variable. For public cross-site use, HTTPS, CORS, and browser cookie policy need an additional deployment setup; this project is configured for local development.

## Permissions and storage

- Visitors can read published events.
- `ASI Event Organizer` and WordPress administrators can create, edit, publish, and delete events.
- A signed-in WordPress user can register for or cancel their own event registration.
- Registration records store WordPress user IDs, event IDs, status, and timestamps in `{table_prefix}asi_event_registrations`.
- Organizer event responses include registration counts; student names and other students' records are not exposed by the REST routes.
- Deactivating the plugin does not delete events or registration records.
