# Sajha News Online Setup Instructions

## Quick Start

### 1. Clear Node.js Cache (Important!)
```bash
# Stop the development server if running (Ctrl+C)

# Clear Next.js cache
rmdir /s .next
# or on Mac/Linux: rm -rf .next

# Clear node_modules if needed
rmdir /s node_modules
npm install
```

### 2. Set up Database
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Open the SQL Editor
3. Copy and paste the entire content from `supabase-schema.sql` (includes ads + storage setup)
4. Click "Run" to execute the SQL

### 3. Install and Run
```bash
npm install
npm run dev
```

### 4. Access the Application
- **Public Site**: http://localhost:443
- **Admin Portal**: http://localhost:443/secret-admin-portal
- **Admin Login**: 
  - Username: `admin`
  - Password: `admin123`

### 5. Fix Admin Login (If Having Issues)
If you can't log in, run this SQL in your Supabase SQL Editor:
```sql
UPDATE admin_users 
SET password_hash = '$2a$12$wJgYKJzTKG88a.MG.qLJ.eQKitDNGTJIfos.42J67mEdLXdCqRQ5S' 
WHERE username = 'admin';
```

## Troubleshooting

### If you see JSX/TypeScript errors:
1. Stop the server (Ctrl+C)
2. Delete `.next` folder: `rmdir /s .next` (Windows) or `rm -rf .next` (Mac/Linux)
3. Restart: `npm run dev`

### If authentication doesn't work:
1. Make sure you've run the `supabase-schema.sql` in your Supabase dashboard
2. Check that your `.env.local` file has the correct Supabase credentials

### If you see "must be owner of table objects" in Supabase SQL Editor:
1. Make sure the SQL Editor **Role** is set to `postgres` and re-run `supabase-schema.sql`
2. If it still happens, set up the `news-images` bucket + policies via `EASY_STORAGE_SETUP.md`

### If images don't load:
The sample images use Unsplash URLs which should work automatically. If not, you can:
1. Replace with your own image URLs in the admin panel
2. Or use different free image services

## Features Included

✅ **10 Sample News Articles** with beautiful images  
✅ **Admin Authentication** with persistent sessions  
✅ **CRUD Operations** for news management  
✅ **Mobile Responsive** design  
✅ **Clean CSS** (no inline styles)  
✅ **Security Features** (hashed passwords, RLS)  

## Default Admin Account
- Username: `admin`
- Password: `admin123`

You can change this by updating the admin_users table in Supabase or creating additional admin accounts through the SQL editor.
