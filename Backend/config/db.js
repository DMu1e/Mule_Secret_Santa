const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // MongoDB connection options
        const options = {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000,
        };

        console.log('🔄 Attempting to connect to MongoDB...');
        const conn = await mongoose.connect(
            process.env.MONGODB_URI || 'mongodb://localhost:27017/secret_santa',
            options
        );
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected');
        });

    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        console.error('Full error:', error);

        // In production, don't exit immediately - let Railway restart
        if (process.env.NODE_ENV === 'production') {
            console.error('⚠️  Will retry connection...');
            // Railway will restart the container
            setTimeout(() => process.exit(1), 5000);
        } else {
            process.exit(1);
        }
    }
};

module.exports = connectDB;