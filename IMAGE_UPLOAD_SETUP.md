# 🖼️ Image Upload System - Setup Instructions

I've completely replaced the URL input system with a professional file upload system! Here's how to set it up:

## 🏗️ What I Built:

✅ **Drag & Drop Upload Area** - Just drag images or click to browse  
✅ **File Validation** - JPEG, PNG, WebP, GIF up to 5MB  
✅ **Progress Bar** - Visual upload progress  
✅ **Image Preview** - See uploaded images immediately  
✅ **Delete Function** - Remove images with X button  
✅ **Fallback Option** - Still can use URL input if needed  
✅ **Professional UI** - Clean, modern design  

## 🛠️ Setup Steps:

### 1. Set Up Supabase Storage
1. Go to your **Supabase Dashboard**
2. Click your project: **your-project-ref**
3. Go to **SQL Editor** → **New Query**
4. Copy **ALL** content from `supabase-schema.sql` (includes storage bucket + policies)
5. Paste and click **"Run"**
6. Wait for: "Storage bucket created successfully!"

### 2. Enable Storage in Dashboard
1. In Supabase, go to **Storage** in the sidebar
2. You should see a bucket called **"news-images"**
3. If not, create it manually:
   - Click **"New bucket"**
   - Name: `news-images`
   - Make it **Public**
   - File size limit: **5MB**

### 3. Test the Upload System
1. Start your app: `npm run dev`
2. Go to admin portal: http://localhost:443/secret-admin-portal
3. Login: `admin` / `admin123`
4. Click **"Create New Post"**
5. You'll see the new **drag & drop upload area**!

## 🎯 How It Works:

### **File Upload Mode** (Default):
- **Drag & drop** images onto the upload area
- **Click** to browse and select files
- **Real-time validation** (file type, size)
- **Progress bar** during upload
- **Immediate preview** after upload

### **URL Mode** (Fallback):
- Click **"Or enter image URL instead"**
- Switch to traditional URL input
- Can switch back to file upload anytime

### **Image Management**:
- **Preview** shows uploaded image
- **X button** to delete/remove image
- **Automatic cleanup** of old images

## 🔧 Features:

- **File Types**: JPEG, PNG, WebP, GIF
- **Size Limit**: 5MB maximum
- **Storage**: Supabase Storage (CDN optimized)
- **Security**: Only authenticated admins can upload
- **Performance**: Direct Supabase CDN delivery

## 🎨 UI Features:

- **Modern drag & drop interface**
- **Hover effects** and visual feedback
- **Upload progress indicator**
- **Error handling** with user-friendly messages
- **Image preview** with delete option
- **Toggle between upload/URL modes**

The system is production-ready and handles all edge cases professionally!
