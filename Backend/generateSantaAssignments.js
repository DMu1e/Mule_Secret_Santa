const User = require('./models/User');

// Helper function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Helper function to generate Santa assignments
async function generateSantaAssignments() {
    try {
        // Get all users with all fields
        const users = await User.find({}).lean();
        let assignments = [];
        let attempts = 0;
        const maxAttempts = 100; // Increased max attempts for better chances

        console.log('\n🎅 Starting Santa Assignment Generation...');
        console.log(`Total users: ${users.length}`);

        // Log cluster information for debugging
        const usersWithClusters = users.filter(u => u.cluster);
        console.log(`Users in clusters: ${usersWithClusters.length}`);
        if (usersWithClusters.length > 0) {
            console.log('Cluster assignments:', usersWithClusters.map(u => `${u.name} -> ${u.cluster}`).join(', '));
        }

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

        // Log restrictions for debugging
        const usersWithRestrictions = adultUsers.filter(u =>
            (u.excludedUsers && u.excludedUsers.length > 0) ||
            (u.includedUsers && u.includedUsers.length > 0) ||
            u.maxGifts > 1
        );
        if (usersWithRestrictions.length > 0) {
            console.log('\n📋 Users with restrictions:');
            usersWithRestrictions.forEach(u => {
                console.log(`  ${u.name}: maxGifts=${u.maxGifts || 1}, excluded=${u.excludedUsers?.length || 0}, included=${u.includedUsers?.length || 0}, cluster=${u.cluster || 'none'}`);
            });
        }

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

            // Sort Santas by cluster size (most constrained first)
            // Users in larger clusters have more restrictions, so assign them first
            const clusterCounts = {};
            users.forEach(user => {
                const cluster = user.cluster || null;
                clusterCounts[cluster] = (clusterCounts[cluster] || 0) + 1;
            });

            availableSantas.sort((a, b) => {
                const aClusterSize = clusterCounts[a.cluster || null] || 0;
                const bClusterSize = clusterCounts[b.cluster || null] || 0;
                // Sort descending - larger clusters first
                if (bClusterSize !== aClusterSize) {
                    return bClusterSize - aClusterSize;
                }
                // Add randomness for same cluster size
                return Math.random() - 0.5;
            });

            // Sort recipients to handle most constrained ones first
            // Recipients with more restrictions (fewer possible Santas) are assigned first
            availableRecipients.sort((a, b) => {
                // Count how many potential Santas each recipient has
                const aPossibleSantas = adultUsers.filter(santa => {
                    if (santa._id.toString() === a._id.toString()) return false;

                    // Cluster restriction: can't gift within same cluster
                    if (santa.cluster && a.cluster && santa.cluster === a.cluster) return false;

                    if (santa.excludedUsers && santa.excludedUsers.some(id => id.toString() === a._id.toString())) return false;
                    if (santa.includedUsers && santa.includedUsers.length > 0 &&
                        !santa.includedUsers.some(id => id.toString() === a._id.toString())) return false;
                    return true;
                }).length;

                const bPossibleSantas = adultUsers.filter(santa => {
                    if (santa._id.toString() === b._id.toString()) return false;

                    // Cluster restriction: can't gift within same cluster
                    if (santa.cluster && b.cluster && santa.cluster === b.cluster) return false;

                    if (santa.excludedUsers && santa.excludedUsers.some(id => id.toString() === b._id.toString())) return false;
                    if (santa.includedUsers && santa.includedUsers.length > 0 &&
                        !santa.includedUsers.some(id => id.toString() === b._id.toString())) return false;
                    return true;
                }).length;

                // Sort ascending - fewer options come first (most constrained)
                if (aPossibleSantas !== bPossibleSantas) {
                    return aPossibleSantas - bPossibleSantas;
                }
                // Add randomness for same constraint level
                return Math.random() - 0.5;
            });

            console.log(`\nAttempt ${attempts}: Trying to assign ${availableRecipients.length} recipients...`);

            // Try to assign a Santa to each recipient
            for (const recipient of availableRecipients) {
                // Filter out invalid Santas based on restrictions
                let possibleSantas = availableSantas.filter(santa => {
                    // Can't be their own Santa
                    if (santa._id.toString() === recipient._id.toString()) return false;

                    // Cluster restriction: can't gift to someone in the same cluster
                    if (santa.cluster && recipient.cluster && santa.cluster === recipient.cluster) {
                        return false;
                    }

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

                    // If Santa has maxGifts > 1, check cluster diversification
                    if (userMaxGifts > 1 && santaAssignments > 0) {
                        const santaCurrentAssignments = assignments.filter(a =>
                            a.santa._id.toString() === santa._id.toString()
                        );

                        // Get clusters of already assigned recipients
                        const assignedClusters = santaCurrentAssignments.map(a => a.recipient.cluster || null);

                        // If recipient's cluster is already in the list, deprioritize but don't exclude
                        // This is handled in the scoring below
                    }

                    return true;
                });

                // Sort possible Santas with enhanced randomness and cluster diversification
                possibleSantas = shuffleArray(possibleSantas).sort((a, b) => {
                    const aCount = assignments.filter(assign => assign.santa._id.toString() === a._id.toString()).length;
                    const bCount = assignments.filter(assign => assign.santa._id.toString() === b._id.toString()).length;

                    // Calculate cluster diversification scores
                    let aScore = aCount;
                    let bScore = bCount;

                    // For Santas with maxGifts > 1, prefer cluster diversification
                    const aMaxGifts = a.maxGifts || 1;
                    const bMaxGifts = b.maxGifts || 1;

                    if (aMaxGifts > 1) {
                        const aAssignments = assignments.filter(assign => assign.santa._id.toString() === a._id.toString());
                        const aClusters = aAssignments.map(assign => assign.recipient.cluster || null);
                        // Penalize if recipient's cluster is already assigned to this Santa
                        if (aClusters.includes(recipient.cluster || null)) {
                            aScore += 5; // Higher score = less priority
                        }
                    }

                    if (bMaxGifts > 1) {
                        const bAssignments = assignments.filter(assign => assign.santa._id.toString() === b._id.toString());
                        const bClusters = bAssignments.map(assign => assign.recipient.cluster || null);
                        // Penalize if recipient's cluster is already assigned to this Santa
                        if (bClusters.includes(recipient.cluster || null)) {
                            bScore += 5; // Higher score = less priority
                        }
                    }

                    // If scores are equal, add randomness
                    if (aScore === bScore) {
                        return Math.random() - 0.5;
                    }

                    return aScore - bScore;
                });

                // If no valid Santas found, mark as invalid and break
                if (possibleSantas.length === 0) {
                    console.log(`  ❌ No valid Santa found for recipient: ${recipient.name} (cluster: ${recipient.cluster || 'none'})`);

                    // Debug: Show why each Santa was filtered out
                    console.log(`     Checking all adult users:`);
                    availableSantas.forEach(santa => {
                        const reasons = [];
                        if (santa._id.toString() === recipient._id.toString()) reasons.push('self');
                        if (santa.cluster && recipient.cluster && santa.cluster === recipient.cluster) reasons.push(`same cluster (${santa.cluster})`);

                        const santaAssignments = assignments.filter(a => a.santa._id.toString() === santa._id.toString()).length;
                        const userMaxGifts = santa.maxGifts || 1;
                        if (santaAssignments >= userMaxGifts) reasons.push(`at capacity (${santaAssignments}/${userMaxGifts})`);

                        if (santa.excludedUsers && santa.excludedUsers.some(id => id.toString() === recipient._id.toString())) reasons.push('excluded');
                        if (santa.includedUsers && santa.includedUsers.length > 0 && !santa.includedUsers.some(id => id.toString() === recipient._id.toString())) reasons.push('not in included list');

                        if (reasons.length > 0) {
                            console.log(`       ${santa.name}: ❌ ${reasons.join(', ')}`);
                        }
                    });

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

    // Track cluster assignments per Santa (for diversification check)
    const santaClusterAssignments = new Map();

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

        // Check cluster restrictions: Santa and recipient cannot be in the same cluster
        if (assignment.santa.cluster && assignment.recipient.cluster &&
            assignment.santa.cluster === assignment.recipient.cluster) {
            return `${assignment.santa.name} and ${assignment.recipient.name} are in the same cluster (${assignment.santa.cluster})`;
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

        // Track cluster assignments for this Santa
        const recipientCluster = assignment.recipient.cluster || null;
        if (!santaClusterAssignments.has(santaId)) {
            santaClusterAssignments.set(santaId, []);
        }
        santaClusterAssignments.get(santaId).push(recipientCluster);

        // Use ONLY the user's explicitly set maxGifts
        const userMaxGifts = assignment.santa.maxGifts || 1;

        if (currentCount + 1 > userMaxGifts) {
            console.log(`  ⚠️  ${assignment.santa.name} has ${currentCount + 1} gifts but maxGifts is ${userMaxGifts}`);
            return 'Santa has exceeded maximum gifts allowed';
        }

        // For Santas with maxGifts > 1, validate cluster diversification
        if (userMaxGifts > 1 && currentCount + 1 > 1) {
            const clusters = santaClusterAssignments.get(santaId);
            const uniqueClusters = new Set(clusters);

            // If all recipients are from the same cluster (and cluster is not null), it's an error
            if (uniqueClusters.size === 1 && recipientCluster !== null) {
                console.log(`  ⚠️  ${assignment.santa.name} is giving to multiple people from the same cluster (${recipientCluster})`);
                return `Santa ${assignment.santa.name} cannot give to multiple people from the same cluster`;
            }
        }
    }

    // Ensure all recipients have a Santa
    if (recipients.size !== assignments.length) {
        return 'Not all recipients have been assigned a Santa';
    }

    return null;
}

module.exports = generateSantaAssignments;