const User = require('./models/User');

// Helper function to generate Santa assignments
async function generateSantaAssignments() {
    try {
        // Get all users
        const users = await User.find({});
        let assignments = [];
        let attempts = 0;
        const maxAttempts = 100; // Increased max attempts for better chances

        console.log('\n🎅 Starting Santa Assignment Generation...');
        console.log(`Total users: ${users.length}`);

        // Pre-validate the assignment possibility
        const adultUsers = users.filter(user => !user.isChild);
        const totalRecipients = users.length;
        const totalSantas = adultUsers.length;
        const maxGiftsPerSanta = Math.ceil(totalRecipients / totalSantas);

        console.log(`Adult users (potential Santas): ${totalSantas}`);
        console.log(`Total recipients: ${totalRecipients}`);
        console.log(`Required gifts per Santa: ${maxGiftsPerSanta}`);

        // Check if we have enough Santas to cover all recipients
        if (totalSantas === 0) {
            throw new Error('No adult users available to be Santas');
        }

        // Check if we have any users at all
        if (totalRecipients === 0) {
            throw new Error('No users available for assignment');
        }

        // Calculate total gift capacity based on ONLY user-set maxGifts
        let totalGiftCapacity = adultUsers.reduce((sum, santa) =>
            sum + (santa.maxGifts || 1), 0);

        console.log(`Total gift capacity: ${totalGiftCapacity} (need: ${totalRecipients})`);

        // Check if capacity is sufficient with user-set maxGifts
        if (totalGiftCapacity < totalRecipients) {
            // List which users need to increase their maxGifts
            const usersWithMaxGifts = adultUsers.map(u => `${u.name}: ${u.maxGifts || 1}`).join(', ');
            console.error(`\n❌ Insufficient gift capacity!`);
            console.error(`   Current capacity: ${totalGiftCapacity}`);
            console.error(`   Required: ${totalRecipients}`);
            console.error(`   User maxGifts: ${usersWithMaxGifts}`);
            console.error(`\n   Solution: Increase maxGifts for some users in the gift restrictions page.`);
            console.error(`   At least ${totalRecipients - totalGiftCapacity} more gift(s) needed.`);

            throw new Error(`Insufficient gift capacity: Santas can give ${totalGiftCapacity} gifts but need ${totalRecipients}. Please increase maxGifts for some users.`);
        }

        // Keep trying until we find a valid assignment or hit max attempts
        while (attempts < maxAttempts) {
            attempts++;
            assignments = [];
            const availableSantas = [...adultUsers];
            const availableRecipients = [...users];
            let isValid = true;

            // Sort recipients to handle most constrained ones first
            // Recipients with more restrictions (fewer possible Santas) are assigned first
            availableRecipients.sort((a, b) => {
                // Count how many potential Santas each recipient has
                const aPossibleSantas = adultUsers.filter(santa => {
                    if (santa._id.toString() === a._id.toString()) return false;
                    if (santa.excludedUsers && santa.excludedUsers.some(id => id.toString() === a._id.toString())) return false;
                    if (santa.includedUsers && santa.includedUsers.length > 0 &&
                        !santa.includedUsers.some(id => id.toString() === a._id.toString())) return false;
                    return true;
                }).length;

                const bPossibleSantas = adultUsers.filter(santa => {
                    if (santa._id.toString() === b._id.toString()) return false;
                    if (santa.excludedUsers && santa.excludedUsers.some(id => id.toString() === b._id.toString())) return false;
                    if (santa.includedUsers && santa.includedUsers.length > 0 &&
                        !santa.includedUsers.some(id => id.toString() === b._id.toString())) return false;
                    return true;
                }).length;

                // Sort ascending - fewer options come first (most constrained)
                return aPossibleSantas - bPossibleSantas;
            });

            console.log(`\nAttempt ${attempts}: Trying to assign ${availableRecipients.length} recipients...`);

            // Try to assign a Santa to each recipient
            for (const recipient of availableRecipients) {
                // Filter out invalid Santas based on restrictions
                let possibleSantas = availableSantas.filter(santa => {
                    // Can't be their own Santa
                    if (santa._id.toString() === recipient._id.toString()) return false;

                    // Count current assignments
                    const santaAssignments = assignments.filter(a =>
                        a.santa._id.toString() === santa._id.toString()
                    ).length;

                    // Use ONLY the user's explicitly set maxGifts (no auto-adjustment)
                    const userMaxGifts = santa.maxGifts || 1;
                    if (santaAssignments >= userMaxGifts) return false;

                    // Check excluded users
                    if (santa.excludedUsers && santa.excludedUsers.some(
                        id => id.toString() === recipient._id.toString()
                    )) return false;

                    // Check included users if specified
                    if (santa.includedUsers && santa.includedUsers.length > 0 &&
                        !santa.includedUsers.some(id => id.toString() === recipient._id.toString())) {
                        return false;
                    }

                    return true;
                });

                // Sort possible Santas by current assignment count (prefer less assigned)
                possibleSantas.sort((a, b) => {
                    const aCount = assignments.filter(assign => assign.santa._id.toString() === a._id.toString()).length;
                    const bCount = assignments.filter(assign => assign.santa._id.toString() === b._id.toString()).length;
                    return aCount - bCount;
                });

                // If no valid Santas found, mark as invalid and break
                if (possibleSantas.length === 0) {
                    console.log(`  ❌ No valid Santa found for recipient: ${recipient.name}`);
                    isValid = false;
                    break;
                }

                // Select Santa with least current assignments
                const selectedSanta = possibleSantas[0];

                // Determine assignment status
                let status = 'valid';

                // Count how many assignments this Santa already has
                const currentSantaAssignments = assignments.filter(a =>
                    a.santa._id.toString() === selectedSanta._id.toString()
                ).length;

                // Use ONLY the user's set maxGifts
                const userMaxGifts = selectedSanta.maxGifts || 1;

                // Warn if Santa is at their maximum
                if (currentSantaAssignments + 1 >= userMaxGifts) {
                    status = 'warning';  // Santa is at or near capacity
                }

                // Add assignment with appropriate status
                assignments.push({
                    santa: selectedSanta,
                    recipient: recipient,
                    status: status
                });

                console.log(`  ✓ Assigned ${selectedSanta.name} -> ${recipient.name} (${currentSantaAssignments + 1}/${userMaxGifts} gifts)`);
            }

            // If we found a valid assignment for all recipients, validate and save
            if (isValid && assignments.length === totalRecipients) {
                console.log(`\n✅ Successfully generated all ${assignments.length} assignments!`);

                // Do additional validation
                const validationError = validateAssignments(assignments, adultUsers);
                if (validationError) {
                    console.log(`  ❌ Validation failed: ${validationError}`);
                    isValid = false;
                    continue;
                }

                // Store assignments in memory
                global.currentAssignments = assignments;
                return assignments;
            }
        }

        console.error(`\n❌ Failed to generate valid assignments after ${maxAttempts} attempts`);
        throw new Error('Could not generate valid assignments after maximum attempts');
    } catch (error) {
        console.error('Error generating assignments:', error);
        throw error;
    }
}

// Helper function to validate assignments
function validateAssignments(assignments, adultUsers) {
    // Track assignments per Santa
    const santaAssignments = new Map();

    // Track recipients to ensure no duplicates
    const recipients = new Set();

    for (const assignment of assignments) {
        // Ensure no child users are Santas
        if (assignment.santa.isChild) {
            return 'Child user cannot be a Santa';
        }

        // Check for duplicate recipients
        if (recipients.has(assignment.recipient._id.toString())) {
            return 'Duplicate recipient found';
        }
        recipients.add(assignment.recipient._id.toString());

        // Ensure no self-assignments
        if (assignment.santa._id.toString() === assignment.recipient._id.toString()) {
            return 'User cannot be their own Santa';
        }

        // Ensure no restricted users are matched
        if (assignment.santa.excludedUsers && assignment.santa.excludedUsers.some(
            id => id.toString() === assignment.recipient._id.toString()
        )) {
            return 'Santa is restricted from gifting to recipient';
        }

        // Check included users restrictions
        if (assignment.santa.includedUsers && assignment.santa.includedUsers.length > 0 &&
            !assignment.santa.includedUsers.some(id => id.toString() === assignment.recipient._id.toString())) {
            return 'Santa must give to someone in their included users list';
        }

        // Track and validate number of assignments per Santa
        const santaId = assignment.santa._id.toString();
        const currentCount = santaAssignments.get(santaId) || 0;
        santaAssignments.set(santaId, currentCount + 1);

        // Use ONLY the user's explicitly set maxGifts
        const userMaxGifts = assignment.santa.maxGifts || 1;

        if (currentCount + 1 > userMaxGifts) {
            console.log(`  ⚠️  ${assignment.santa.name} has ${currentCount + 1} gifts but maxGifts is ${userMaxGifts}`);
            return 'Santa has exceeded maximum gifts allowed';
        }
    }

    // Ensure all recipients have a Santa
    if (recipients.size !== assignments.length) {
        return 'Not all recipients have been assigned a Santa';
    }

    return null;
}

module.exports = generateSantaAssignments;