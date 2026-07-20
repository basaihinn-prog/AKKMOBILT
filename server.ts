// AKK Mobile Enterprise dev/prod server
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { initializeDatabase } from './src/lib/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Initialize Supabase connection
await initializeDatabase();

// Development: Use Vite for hot module replacement
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

// Production: Serve built files
app.use(express.static(path.join(__dirname, 'dist')));

// API routes are handled via Next.js API routes in src/app/api/
// This server only serves the frontend and provides Vite dev server

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5173;
app.listen(PORT, () => {
  console.log(`[Server] ✓ AKK Mobile Enterprise listening on port ${PORT}`);
  console.log(`[DB] ✓ Supabase connection verified`);
});
