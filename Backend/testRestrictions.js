require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function testRestrictions() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
        console.log('✅ Connected to MongoDB\n');

        // Get all users
        const users = await User.find({}).lean();
        console.log(`📊 Total users: ${users.length}\n`);

        // Display all adult users with their restrictions
        const adultUsers = users.filter(u => !u.isChild);
        console.log('👥 Adult Users (Santas):');
        console.log('='.repeat(80));

        adultUsers.forEach(user => {
            console.log(`\n${user.name}:`);
            console.log(`  - maxGifts: ${user.maxGifts || 1}`);
            console.log(`  - cluster: ${user.cluster || 'none'}`);
            console.log(`  - excludedUsers: ${user.excludedUsers?.length || 0} users`);
            console.log(`  - includedUsers: ${user.includedUsers?.length || 0} users`);
        });

        // Show cluster distribution
        console.log('\n\n🏘️  Cluster Distribution:');
        console.log('='.repeat(80));

        const clusterMap = {};
        users.forEach(user => {
            const cluster = user.cluster || 'Unassigned';
            if (!clusterMap[cluster]) {
                clusterMap[cluster] = [];
            }
            clusterMap[cluster].push(user.name);
        });

        for (const [cluster, members] of Object.entries(clusterMap)) {
            console.log(`\n${cluster} (${members.length} members):`);
            console.log(`  ${members.join(', ')}`);
        }

        // Calculate statistics
        console.log('\n\n📈 Statistics:');
        console.log('='.repeat(80));

        const totalCapacity = adultUsers.reduce((sum, u) => sum + (u.maxGifts || 1), 0);
        const totalRecipients = users.length;
        const usersWithRestrictions = adultUsers.filter(u =>
            (u.excludedUsers && u.excludedUsers.length > 0) ||
            (u.includedUsers && u.includedUsers.length > 0)
        ).length;
        const usersInClusters = users.filter(u => u.cluster).length;

        console.log(`Total recipients needed: ${totalRecipients}`);
        console.log(`Total gift capacity: ${totalCapacity}`);
        console.log(`Capacity surplus/deficit: ${totalCapacity - totalRecipients}`);
        console.log(`Users with exclude/include restrictions: ${usersWithRestrictions}`);
        console.log(`Users assigned to clusters: ${usersInClusters}`);

        if (totalCapacity < totalRecipients) {
            console.log('\n⚠️  WARNING: Insufficient capacity to assign all recipients!');
            console.log(`   Need ${totalRecipients - totalCapacity} more gift capacity`);
        } else {
            console.log('\n✅ Sufficient capacity available');
        }

        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testRestrictions();
