# 🚀 QUICK SETUP - NewzNepal

Follow these steps **exactly** to get your news portal working:

## 1. 🗄️ Set Up Database

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/projects)
2. Click on your project: **zmiqsuhmxfiqlidudywz**
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**
5. Copy the **ENTIRE** content from `simple-setup.sql` file
6. Paste it in the SQL editor
7. Click **"Run"** (wait for it to complete)
8. You should see: "Database setup completed successfully!"

## 2. 🛠️ Fix Development Environment

```bash
# Stop the server if running (Ctrl+C)

# Clear cache completely
rmdir /s .next
# On Mac/Linux: rm -rf .next

# Install dependencies
npm install

# Start fresh
npm run dev
```

## 3. 🔐 Access Your Site

- **Public Site**: http://localhost:3000
- **Admin Portal**: http://localhost:3000/secret-admin-portal

### Admin Login:
- **Username**: `admin`
- **Password**: `admin123`

## 4. ✅ What Should Work Now:

- ✅ Public news feed with 5 sample articles with images
- ✅ Admin login with password visibility toggle
- ✅ Create/Edit/Delete news posts
- ✅ Image URL support
- ✅ Mobile responsive design
- ✅ Persistent admin sessions (30 days)

## 🐛 If You Still Have Issues:

### Database Connection Issues:
- Check your `.env.local` file has correct Supabase credentials
- Verify you ran the SQL in the correct project

### Auth Errors:
- Clear browser cookies/localStorage
- Try incognito/private browser window

### File Conflicts:
- Make sure there's only ONE `auth.ts` file (not `auth.tsx`)
- Restart your development server

## 📁 Project Structure:
```
src/
├── app/
│   ├── api/auth/          # Login/logout endpoints
│   ├── api/posts/         # CRUD operations
│   ├── secret-admin-portal/ # Admin interface
│   └── page.tsx           # Public homepage
├── components/            # React components
├── lib/                  # Auth & Supabase config
└── styles/               # CSS files (no inline styles)
```

**IMPORTANT**: The admin portal URL (`/secret-admin-portal`) is completely hidden from the public interface for security.