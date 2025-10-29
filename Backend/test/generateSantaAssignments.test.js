const mongoose = require('mongoose');
const User = require('../models/User');
const generateSantaAssignments = require('../generateSantaAssignments');

describe('Santa Assignment Tests', () => {
    beforeAll(async () => {
        // Connect to test database
        await mongoose.connect('mongodb://localhost/santa-test', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        // Clear users collection before each test
        await User.deleteMany({});
    });

    test('Children cannot be assigned as Santas', async () => {
        // Create test users
        const adult = await User.create({
            name: 'Adult User',
            email: 'adult@test.com',
            password: 'password123'
        });

        const child = await User.create({
            name: 'Child User',
            isChild: true,
            parentUser: adult._id,
            age: 10
        });

        const assignments = await generateSantaAssignments();

        // Verify no child is a Santa
        const childAssignments = assignments.filter(
            assignment => assignment.santa._id.toString() === child._id.toString()
        );
        expect(childAssignments.length).toBe(0);
    });

    test('Users cannot gift to restricted members', async () => {
        // Create test users
        const user1 = await User.create({
            name: 'User 1',
            email: 'user1@test.com',
            password: 'password123'
        });

        const user2 = await User.create({
            name: 'User 2',
            email: 'user2@test.com',
            password: 'password123',
            excludedUsers: [user1._id]
        });

        const assignments = await generateSantaAssignments();

        // Verify user2 is not assigned to gift to user1
        const restrictedAssignments = assignments.filter(
            assignment =>
                assignment.santa._id.toString() === user2._id.toString() &&
                assignment.recipient._id.toString() === user1._id.toString()
        );
        expect(restrictedAssignments.length).toBe(0);
    });

    test('Users can be Santa to multiple people if maxGifts allows', async () => {
        // Create test users
        const santa = await User.create({
            name: 'Multi Santa',
            email: 'santa@test.com',
            password: 'password123',
            maxGifts: 3
        });

        const recipients = await Promise.all([
            User.create({
                name: 'Recipient 1',
                email: 'r1@test.com',
                password: 'password123'
            }),
            User.create({
                name: 'Recipient 2',
                email: 'r2@test.com',
                password: 'password123'
            }),
            User.create({
                name: 'Recipient 3',
                email: 'r3@test.com',
                password: 'password123'
            })
        ]);

        const assignments = await generateSantaAssignments();

        // Count how many gifts the santa is giving
        const santaAssignments = assignments.filter(
            assignment => assignment.santa._id.toString() === santa._id.toString()
        );

        // Should be able to give up to maxGifts
        expect(santaAssignments.length).toBeGreaterThan(0);
        expect(santaAssignments.length).toBeLessThanOrEqual(3);
    });
});