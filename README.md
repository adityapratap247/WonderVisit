# 🏔️ WonderVisit

WonderVisit is a full-stack Airbnb-style listings platform built with Node.js, Express, and MongoDB. Users can browse destinations, create and manage their own listings, leave reviews, and explore locations on an interactive map.

**Live demo:**
https://wondervisit-1.onrender.com

---

## ✨ Features

- **User authentication** — sign up, log in, log out with secure sessions (Passport.js + `passport-local-mongoose`)
- **Listings CRUD** — create, view, edit, and delete property listings
- **Image uploads** — listing photos stored and served via Cloudinary
- **Reviews** — leave star ratings and comments on listings; only the review's author can delete it
- **Interactive maps** — each listing's location is geocoded and displayed on a Leaflet map with a marker
- **Category filters** — browse listings by category (Rooms, Mountains, Beaches, Resorts, Lodges) or Trending (most-viewed)
- **Search** — search listings by title, location, or country
- **Flash messages** — success/error feedback on key actions
- **Responsive design** — mobile-friendly layout across all pages
- **Session storage** — sessions persisted in MongoDB via `connect-mongo`

---

## 🛠️ Tech Stack

**Backend**
- Node.js, Express.js
- MongoDB with Mongoose
- Passport.js (`passport-local`, `passport-local-mongoose`) for authentication
- `connect-mongo` for session storage
- `connect-flash` for flash messages
- Joi for server-side validation

**Frontend**
- EJS with `ejs-mate` for templating and layouts
- Bootstrap 5
- Leaflet.js for interactive maps
- Font Awesome icons

**Other integrations**
- Cloudinary + `multer` (`multer-storage-cloudinary`) for image hosting
- OpenStreetMap Nominatim for geocoding

**Deployment**
- Render (web service)
- MongoDB Atlas (database)

---

## 📁 Project Structure

```
Project_1_airbin/
├── controllers/       # Route handler logic (listings, reviews, users)
├── models/            # Mongoose schemas (Listing, Review, User)
├── routes/            # Express routers
├── views/             # EJS templates
│   ├── layouts/       # Boilerplate layout
│   ├── includes/      # Navbar, footer, flash partials
│   ├── listings/
│   └── users/
├── public/             # Static assets (CSS, client-side JS, uploads)
├── utils/              # Helper functions (geocoding, error wrapper, custom errors)
├── middleware.js        # Auth & authorization middleware
├── schema.js            # Joi validation schemas
├── cloudConfig.js        # Cloudinary configuration
├── app.js                # App entry point
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (or local MongoDB instance)
- A [Cloudinary](https://cloudinary.com/) account for image uploads

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-username>/<your-repo>.git
   cd <your-repo>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the project root:
   ```env
   ATLASDB_URL=mongodb+srv://<username>:<password>@<cluster-url>/WonderVisit?retryWrites=true&w=majority
   SECRET=your_session_secret
   CLOUD_NAME=your_cloudinary_cloud_name
   CLOUD_API_KEY=your_cloudinary_api_key
   CLOUD_API_SECRET=your_cloudinary_api_secret
   ```

4. **Run the app**
   ```bash
   nodemon app.js
   ```
   The app will be available at `http://localhost:8080`.

---

## 🌍 Deployment

This project is configured to deploy on [Render](https://render.com/):

1. Connect your GitHub repository to a new Render Web Service.
2. Set the build command: `npm install`
3. Set the start command: `node app.js`
4. Add all environment variables from `.env` in the Render dashboard under **Environment**.
5. Render automatically redeploys on every push to `main`.

> **Note:** Render assigns a dynamic port at runtime via `process.env.PORT` — make sure `app.js` uses `process.env.PORT || 8080` rather than a hardcoded port.

---

## 📌 Roadmap

- [ ] Backfill categories for older seeded listings
- [ ] Add "most trending" sorting beyond a simple view-count threshold
- [ ] Pagination for listings index
- [ ] Improve mobile navigation UX

---

## 🙏 Acknowledgements

Built as part of a full-stack web development learning project (Apna College).

## 📄 License

This project is for educational purposes.
