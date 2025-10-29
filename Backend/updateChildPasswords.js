require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const updateChildPasswords = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Find all child users
        const childUsers = await User.find({ isChild: true });
        console.log(`\n📊 Found ${childUsers.length} child user(s)`);

        if (childUsers.length === 0) {
            console.log('✨ No child users to update');
            await mongoose.disconnect();
            return;
        }

        // Update each child user with default password
        const defaultPassword = 'password';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        let updatedCount = 0;
        for (const child of childUsers) {
            // Update password directly without triggering pre-save hook again
            await User.updateOne(
                { _id: child._id },
                { $set: { password: hashedPassword } }
            );
            console.log(`✅ Updated password for child user: ${child.name}`);
            updatedCount++;
        }

        console.log(`\n🎉 Successfully updated ${updatedCount} child user(s) with default password "password"`);
        console.log('\n✨ All child users can now login with:');
        childUsers.forEach(child => {
            console.log(`   - Username: ${child.name}`);
            console.log(`     Password: password`);
        });

        // Disconnect from database
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error updating child passwords:', error);
        process.exit(1);
    }
};

// Run the update
updateChildPasswords();
