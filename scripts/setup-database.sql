-- MongoDB setup script (run these commands in MongoDB shell or MongoDB Compass)

-- Create database
use your_app_database;

-- Create users collection with indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });
db.users.createIndex({ "provider": 1 });

-- Create sample user (for testing - remove in production)
db.users.insertOne({
  name: "Test User",
  email: "test@example.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G", // password: "password123"
  provider: "email",
  createdAt: new Date(),
  lastLogin: new Date()
});

-- Create sessions collection (optional, for session management)
db.sessions.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });
db.sessions.createIndex({ "userId": 1 });
