# Switch Account / Department Scope Fix

Based on the Auth + Payment baseline.

Changes:
- Restored the top-right `Switch Account` action. It logs out the current session and returns to portal selection, so the next account must authenticate again.
- Removed the `ALL / MUNICIPALITY / FSSAI / FIRE / GST / SHOPS` department filter from the official dashboard. An official can no longer use the UI to browse another department's queue.
- The official dashboard now displays the authenticated official's assigned department.
- Backend application listing and department action authorization remain department-scoped.
- No document-verification implementation was changed.

Files changed:
- frontend/src/components/Navbar.jsx
- frontend/src/pages/OfficialDashboard.jsx
- frontend/src/App.jsx

The frontend build could not be run in this environment because node_modules/vite is not installed. Run `npm install` followed by `npm run build` locally.
