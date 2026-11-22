require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const CHILD_PASSWORD = 'pass1234';
const WORDS = [
    'pass',
    'santa',
    'team',
    'gift',
    'xmas',
    'tree',
    'angel',
    'choir',
    'bell',
    'snow',
    'feast',
    'carol'
];

function randomInt(max) {
    return Math.floor(Math.random() * max);
}

function generateAdultPassword(usedPasswords) {
    let password;

    do {
        const word = WORDS[randomInt(WORDS.length)];
        const digitCount = 8 - word.length;
        let digits = '';

        for (let index = 0; index < digitCount; index++) {
            digits += randomInt(10);
        }

        password = word + digits;
    } while (usedPasswords.has(password));

    return password;
}

async function resetAllPasswords() {
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not configured');
    }

    if (!process.argv.includes('--confirm')) {
        throw new Error('Refusing to reset passwords. Re-run with --confirm');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({}, '_id name isChild').lean();
    if (users.length === 0) {
        throw new Error('No users found');
    }

    const usedPasswords = new Set();
    const adultCredentials = [];
    let childCount = 0;
    let adultCount = 0;

    for (const user of users) {
        const isChild = Boolean(user.isChild);
        const password = isChild
            ? CHILD_PASSWORD
            : generateAdultPassword(usedPasswords);

        if (!isChild) {
            usedPasswords.add(password);
            adultCredentials.push({ name: user.name, password });
            adultCount++;
        } else {
            childCount++;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.updateOne(
            { _id: user._id },
            { $set: { password: hashedPassword } }
        );
    }

    const verifiedCount = await User.countDocuments({
        password: { $type: 'string', $ne: null }
    });

    if (verifiedCount !== users.length) {
        throw new Error(`Password verification failed: expected ${users.length}, found ${verifiedCount}`);
    }

    const reportDir = path.join(
        process.env.USERPROFILE || process.env.HOME || process.cwd(),
        '.copilot',
        'session-state',
        '33c9cbcb-4be6-4492-a943-d2d5523cca2f',
        'files'
    );
    fs.mkdirSync(reportDir, { recursive: true });

    const reportPath = path.join(reportDir, 'adult-passwords.json');
    fs.writeFileSync(
        reportPath,
        JSON.stringify(adultCredentials, null, 2),
        { encoding: 'utf8', mode: 0o600 }
    );

    console.log(`Updated ${users.length} users: ${adultCount} adult, ${childCount} child`);
    console.log('Adult user passwords:');
    for (const credential of adultCredentials) {
        console.log(`${credential.name}: ${credential.password}`);
    }
    console.log(`Private credential report: ${reportPath}`);
}

resetAllPasswords()
    .catch((error) => {
        console.error(`Password reset failed: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });
