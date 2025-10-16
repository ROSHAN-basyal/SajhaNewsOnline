I want to create a newsportal website named newznepal.com. It doesnot need to be much fancy. On readers side, The website should be very plain and simple. THey should just be able to scroll through the page to read news just like reddit.com scroll feed. Also Each post should have a title and body. if the text content or media contents are more it should only open which clicked on more option like facebook or other social media. Also, There should be a admin route which should be very secretive never ever mentioned on client side which the user will Enter to post the news. But, Remember the admin page should be protected and authenticated via ID and password and they donot need to enter it every time they login. It should be stored somewhere in the browser. But, Remember the admin page should be very very very well organized and well managed SO, that the admin can easily post the news, media files, text etc. Also. It should allow the user to edit, delete the past news posts too. I want to set the project's database in supabase free tier. I prefer Postgres for this project. But I wouldnot mind your recommendation. This is my supbase project ID: zmiqsuhmxfiqlidudywz and This are the database setup indo: Project API
Your API is secured behind an API gateway which requires an API Key for every request.
You can use the parameters below to use Supabase client libraries.

Project URL
https://zmiqsuhmxfiqlidudywz.supabase.co

Copy
A RESTful endpoint for querying and managing your database.
API Key

anon
public
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptaXFzdWhteGZpcWxpZHVkeXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MDg1ODEsImV4cCI6MjA3MjI4NDU4MX0.Zq4uhibb86nJxHdVKhFFFWxMxX_9JV-IkPxc0oNGAPc

Copy
This key is safe to use in a browser if you have enabled Row Level Security (RLS) for your tables and configured policies. You may also use the service key which can be found here to bypass RLS.

Javascript
Dart
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zmiqsuhmxfiqlidudywz.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

Focus very very much on design aspect too. I want css on repective css files. Never ever use inline CSS
