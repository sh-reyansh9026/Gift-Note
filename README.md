# GiftNote

A full-stack MERN application for small handmade business owners to create personalized digital gift messages accessed via QR code.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, React Router
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **File Storage**: Cloudinary (cloud image and audio storage)
- **QR Code Generation**: qrcode npm package

## Features

- **Seller Dashboard**: View and manage all gift messages created by the logged-in seller
- **Create Gift Messages**: Form to create personalized gift messages with optional photo and voice note uploads
- **QR Code Generation**: Automatic QR code generation for each gift message
- **Public Recipient View**: No-login-required page for recipients to view their gift messages
- **Authentication**: Secure seller signup/login with JWT authentication
- **Google OAuth**: Sign up/login with Google account alongside email/password
- **Multi-tenant**: Each seller only sees their own gift messages
- **Subscription System**: Manual subscription management with automatic expiry enforcement
- **Admin Panel**: Secure admin interface for managing user subscriptions and payments

## Project Structure

```
Gift Note/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React Context (AuthContext)
│   │   ├── pages/         # Page components
│   │   ├── App.jsx        # Main App component with routing
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles with Tailwind
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── server/                # Express backend
│   ├── models/            # Mongoose models
│   │   ├── Seller.js
│   │   └── GiftMessage.js
│   ├── routes/            # API routes
│   │   ├── auth.js
│   │   └── giftMessages.js
│   ├── middleware/        # Custom middleware
│   │   └── auth.js
│   ├── server.js          # Main server file
│   ├── package.json
│   └── .env.example
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas connection string)
- Cloudinary account (for file storage)
- Google Cloud Console project (for Google OAuth)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Gift Note"
```

### 2. Backend Setup

Navigate to the server directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the server directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
MONGO_URI=mongodb://localhost:27017/giftnote
# Or use MongoDB Atlas: mongodb+srv://<username>:<password>@cluster.mongodb.net/giftnote
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
PORT=5000
FRONTEND_URL=http://localhost:5173

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

#### Getting Cloudinary Credentials

1. Go to [Cloudinary](https://cloudinary.com) and sign up for a free account
2. From your dashboard, navigate to Settings → Account
3. Copy your:
   - **Cloud name** (from the top of the dashboard)
   - **API Key** (from the API Keys section)
   - **API Secret** (from the API Keys section)
4. Add these values to your `.env` file as shown above

#### Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Choose **External** user type and click Create
5. Fill in the required fields:
   - App name: "GiftNote"
   - User support email: your email
   - Developer contact email: your email
6. Click **Save and Continue** through the remaining steps (you can skip optional fields)
7. Navigate to **APIs & Services** → **Credentials**
8. Click **Create Credentials** → **OAuth client ID**
9. Choose **Web application** as the application type
10. Add the following authorized redirect URIs:
    - Development: `http://localhost:5000/api/auth/google/callback`
    - Production: `https://your-backend-domain.com/api/auth/google/callback`
11. Click **Create**
12. Copy the **Client ID** and **Client Secret** from the OAuth client created
13. Add these values to your `.env` file as shown above

### 3. Frontend Setup

Navigate to the client directory:

```bash
cd ../client
```

Install dependencies:

```bash
npm install
```

### 4. Running the Application

**Terminal 1 - Start the Backend:**

```bash
cd server
npm run dev
```

The server will run on `http://localhost:5000`

**Terminal 2 - Start the Frontend:**

```bash
cd client
npm run dev
```

The frontend will run on `http://localhost:5173`

### 5. Access the Application

- Open your browser and navigate to `http://localhost:5173`
- You'll be redirected to the login page
- Click "Sign up" to create a new seller account
- After signup, you'll be redirected to the dashboard

## Usage

### Creating a Gift Message

1. Log in to your seller account
2. Click "Create New Gift Message" on the dashboard
3. Fill in the recipient name, sender name, and message
4. Optionally:
   - Upload a photo (PNG, JPG, WEBP up to 5MB)
   - Upload a voice note (MP3, WAV, M4A up to 10MB) OR record directly in-browser
5. Click "Create Gift Message"
6. Download the generated QR code

### Viewing a Gift Message (Recipient)

1. Scan the QR code with your phone camera
2. You'll be directed to the gift message page
3. View the personalized message, photo, and listen to the voice note (if provided)
4. Click "Shop More" to visit the seller's Instagram/catalog

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create a new seller account (email/password)
- `POST /api/auth/login` - Login to seller account (email/password)
- `GET /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/google/callback` - Handle Google OAuth callback
- `GET /api/auth/me` - Get current seller info (protected)

### Gift Messages

- `POST /api/giftmessages` - Create a new gift message (protected, requires active subscription)
- `GET /api/giftmessages` - Get all gift messages for logged-in seller (protected, requires active subscription)
- `GET /api/giftmessages/:slug` - Get gift message by slug (public)
- `DELETE /api/giftmessages/:id` - Delete a gift message (protected, requires active subscription)

### Subscription

- `GET /api/subscription/status` - Get current user's subscription status (protected)

### Admin (requires admin privileges)

- `GET /api/admin/users` - List all users with subscription status (admin only)
- `GET /api/admin/users/:userId` - Get detailed user information including payment history (admin only)
- `POST /api/admin/users/:userId/activate` - Activate/renew user subscription (admin only)
- `GET /api/admin/users/:userId/payments` - Get payment history for a user (admin only)

## Environment Variables

### Server (.env)

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token generation
- `PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Frontend URL for QR code generation
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_CALLBACK_URL` - Google OAuth callback URL

## Development Notes

### File Uploads

Files are uploaded directly to Cloudinary cloud storage:
- Photos are stored in: `giftnote/{sellerId}/photos/`
- Audio files are stored in: `giftnote/{sellerId}/audio/`

This cloud-based storage ensures scalability and easy access from anywhere. Files are not stored locally on the server.

### Tailwind CSS Warnings

You may see "Unknown at rule @tailwind" warnings in your IDE. These are normal and will be resolved when you run `npm run dev` as Tailwind processes the directives.

### Mobile Responsiveness

The application is designed mobile-first and is fully responsive for optimal use on phones and tablets.

## Subscription System

The application includes a manual subscription system with automatic expiry enforcement:

### Subscription Plans

- **1 Month**: ₹299
- **3 Months**: ₹799 (Save 10%)
- **1 Year**: ₹2499 (Save 30%)

*Note: Plan prices and contact information can be customized in `client/src/config/subscription.js`*

### How It Works

1. Users sign up and are redirected to the subscription required page
2. Users contact you via WhatsApp/Instagram to subscribe (manual payment via UPI)
3. You (as admin) activate their subscription through the admin panel
4. The system automatically calculates renewal dates based on existing subscription status
5. Subscription enforcement is server-side - expired users cannot access protected features

**Important**: Before deploying, update the contact information in `client/src/config/subscription.js` with your actual WhatsApp number, Instagram handle, and email address.

### Admin Panel

- Access at `/admin` (requires admin privileges)
- View all users with their subscription status
- Search users by name or email
- View detailed user information and payment history
- Activate/renew subscriptions with automatic date calculation
- Add notes to payment records

### Setting Up the First Admin User

Since there's no self-serve admin signup, you need to manually set a user as admin. See [ADMIN_SETUP.md](./ADMIN_SETUP.md) for detailed instructions.

### Subscription Status Logic

- **Active**: User has a subscription with endDate > current date
- **Expired**: User has a subscription but endDate <= current date  
- **None**: User has no subscription record

The subscription status is always calculated server-side based on the endDate - no stored "active" flag is trusted.

### Renewal Date Calculation

The system intelligently calculates new end dates:

- **Active renewal**: If existing subscription is still active, extends from the current expiry date
- **Expired renewal**: If subscription is expired or doesn't exist, starts from today

Example:
- Existing endDate Sept 25, paid Sept 10, 1 month plan → new endDate Oct 25
- Existing endDate Aug 25, paid Sept 10, 1 month plan → new endDate Oct 10

## Future Enhancements

- Email notifications for recipients
- Custom branding options for sellers
- Analytics dashboard for sellers
- Bulk QR code generation
- Template messages
- Video message support
- Automated payment reminders
- Subscription analytics
