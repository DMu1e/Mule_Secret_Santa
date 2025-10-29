const mongoose = require('mongoose');
const User = require('./models/User');
const Wishlist = require('./models/Wishlist');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/secretsanta')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

async function cleanupOrphanedWishlists() {
    try {
        console.log('🔍 Checking for orphaned wishlists...');

        // Find all wishlists
        const wishlists = await Wishlist.find();
        console.log(`Found ${wishlists.length} total wishlists`);

        let deletedCount = 0;
        let validCount = 0;

        // Check each wishlist to see if the user exists
        for (const wishlist of wishlists) {
            const userExists = await User.findById(wishlist.user);

            if (!userExists) {
                console.log(`❌ Deleting orphaned wishlist for deleted user ID: ${wishlist.user}`);
                await Wishlist.deleteOne({ _id: wishlist._id });
                deletedCount++;
            } else {
                validCount++;
            }
        }

        console.log('\n✅ Cleanup complete!');
        console.log(`📊 Results:`);
        console.log(`   - Valid wishlists: ${validCount}`);
        console.log(`   - Orphaned wishlists deleted: ${deletedCount}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
}

// Run the cleanup
cleanupOrphanedWishlists();
