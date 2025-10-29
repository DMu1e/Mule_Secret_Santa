require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const User = require('./models/User');
const Wishlist = require('./models/Wishlist');

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;
const generateSantaAssignments = require('./generateSantaAssignments');

// Middleware
app.use(cors());
app.use(express.json());

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { name, password } = req.body;

        // Find user
        const user = await User.findOne({ name });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Verify password
        const isValidPassword = await user.matchPassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                name: user.name,
                isAdmin: user.isAdmin,
                isChild: user.isChild
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                isChild: user.isChild
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({
            $or: [{ email }, { name }]
        });

        if (userExists) {
            return res.status(400).json({
                message: 'User with this email or name already exists'
            });
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, name: user.name },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Admin authentication middleware
const requireAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

// Wishlist endpoints
// Search for a user's wishlist
app.get('/api/wishlist/search/:username', authenticateToken, async (req, res) => {
    try {
        const { username } = req.params;

        // Find the user first
        const user = await User.findOne({ name: username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get their wishlist
        let wishlist = await Wishlist.findOne({ user: user._id });

        if (!wishlist) {
            wishlist = {
                user: user._id,
                items: []
            };
        }

        res.json({ wishlist });
    } catch (error) {
        console.error('Search wishlist error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get user's own wishlist
app.get('/api/wishlist', authenticateToken, async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user.userId });

        if (!wishlist) {
            // Create new wishlist if none exists
            wishlist = await Wishlist.create({
                user: req.user.userId,
                items: []
            });
        }

        res.json(wishlist);
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add item to wishlist
app.post('/api/wishlist/items', authenticateToken, async (req, res) => {
    try {
        const { name, description, link, priority } = req.body;

        let wishlist = await Wishlist.findOne({ user: req.user.userId });

        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: req.user.userId,
                items: []
            });
        }

        wishlist.items.push({
            name,
            description,
            link,
            priority
        });

        await wishlist.save();
        res.status(201).json(wishlist);
    } catch (error) {
        console.error('Add wishlist item error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete item from wishlist
app.delete('/api/wishlist/items/:itemId', authenticateToken, async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user.userId });

        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        wishlist.items = wishlist.items.filter(item =>
            item._id.toString() !== req.params.itemId
        );

        await wishlist.save();
        res.json(wishlist);
    } catch (error) {
        console.error('Delete wishlist item error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update item in wishlist
app.put('/api/wishlist/items/:itemId', authenticateToken, async (req, res) => {
    try {
        const { name, description, link, priority, purchased } = req.body;
        const wishlist = await Wishlist.findOne({ user: req.user.userId });

        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        const item = wishlist.items.id(req.params.itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        item.name = name || item.name;
        item.description = description || item.description;
        item.link = link || item.link;
        item.priority = priority || item.priority;
        item.purchased = purchased !== undefined ? purchased : item.purchased;

        await wishlist.save();
        res.json(wishlist);
    } catch (error) {
        console.error('Update wishlist item error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get current user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            isChild: user.isChild,
            maxGifts: user.maxGifts || 1
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update user profile (name and email)
app.put('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }

        // Check if email is already taken by another user
        if (email !== req.user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser && existingUser._id.toString() !== req.user.userId) {
                return res.status(400).json({ message: 'Email is already in use' });
            }
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = name;
        user.email = email;
        await user.save();

        res.json({
            message: 'Profile updated successfully',
            name: user.name,
            email: user.email
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update user password
app.put('/api/user/password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all users
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        // Get all users but only return necessary fields
        const users = await User.find({}, 'name email');
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all wishlists
app.get('/api/wishlists', authenticateToken, async (req, res) => {
    try {
        // Get all wishlists and populate with user information
        const wishlists = await Wishlist.find().populate('user', 'name email').lean();

        // Filter out wishlists where user was deleted (null/undefined)
        const validWishlists = wishlists.filter(wishlist => wishlist.user != null);

        res.json(validWishlists);
    } catch (error) {
        console.error('Get wishlists error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create admin user endpoint
app.post('/api/create-admin', async (req, res) => {
    try {
        const { adminSecret } = req.body;

        // Verify admin secret key
        if (adminSecret !== (process.env.ADMIN_SECRET || 'admin-secret-key')) {
            return res.status(401).json({ message: 'Invalid admin secret key' });
        }

        // Check if admin already exists
        let admin = await User.findOne({ name: 'admin' });

        if (admin) {
            return res.status(400).json({ message: 'Admin user already exists' });
        }

        // Create admin user
        admin = await User.create({
            name: 'admin',
            email: 'admin@example.com',
            password: process.env.ADMIN_PASSWORD || 'admin123456',
            isAdmin: true
        });

        res.status(201).json({ message: 'Admin user created successfully' });
    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// Admin Routes

// Update user restrictions (admin only)
app.put('/api/admin/users/:userId/restrictions', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { maxGifts, excludedUsers, includedUsers } = req.body;
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate maxGifts
        if (typeof maxGifts !== 'number' || maxGifts < 1) {
            return res.status(400).json({ message: 'maxGifts must be a positive number' });
        }

        // Validate that excludedUsers and includedUsers are arrays of valid user IDs
        if (excludedUsers) {
            if (!Array.isArray(excludedUsers)) {
                return res.status(400).json({ message: 'excludedUsers must be an array' });
            }
            // Verify all users exist
            const excludedCount = await User.countDocuments({
                _id: { $in: excludedUsers }
            });
            if (excludedCount !== excludedUsers.length) {
                return res.status(400).json({ message: 'Some excluded users do not exist' });
            }
        }

        if (includedUsers) {
            if (!Array.isArray(includedUsers)) {
                return res.status(400).json({ message: 'includedUsers must be an array' });
            }
            // Verify all users exist
            const includedCount = await User.countDocuments({
                _id: { $in: includedUsers }
            });
            if (includedCount !== includedUsers.length) {
                return res.status(400).json({ message: 'Some included users do not exist' });
            }
        }

        // Cannot have the same user in both excluded and included lists
        if (excludedUsers && includedUsers) {
            const overlap = excludedUsers.filter(id => includedUsers.includes(id));
            if (overlap.length > 0) {
                return res.status(400).json({
                    message: 'A user cannot be in both excluded and included lists'
                });
            }
        }

        // Update user restrictions
        user.maxGifts = maxGifts;
        user.excludedUsers = excludedUsers || [];
        user.includedUsers = includedUsers || [];

        await user.save();

        // Generate new assignments after updating restrictions
        try {
            const newAssignments = await generateSantaAssignments();
            res.json({
                message: 'User restrictions updated and assignments regenerated successfully',
                restrictions: {
                    maxGifts: user.maxGifts,
                    excludedUsers: user.excludedUsers,
                    includedUsers: user.includedUsers
                },
                assignments: newAssignments
            });
        } catch (assignmentError) {
            res.status(400).json({
                message: 'Restrictions updated but failed to generate valid assignments. Please review restrictions.',
                error: assignmentError.message
            });
        }
    } catch (error) {
        console.error('Update user restrictions error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all users with full details (admin only)
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (error) {
        console.error('Admin get users error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update user details (admin only)
app.put('/api/admin/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, email, isAdmin } = req.body;
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (isAdmin !== undefined) user.isAdmin = isAdmin;

        await user.save();
        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('Admin update user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete user (admin only)
app.delete('/api/admin/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Don't allow deleting other admins
        if (user.isAdmin) {
            return res.status(403).json({ message: 'Cannot delete admin users' });
        }

        // Delete user's wishlist
        await Wishlist.deleteOne({ user: user._id });

        // Delete user
        await user.deleteOne();

        res.json({ message: 'User and associated data deleted successfully' });
    } catch (error) {
        console.error('Admin delete user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get current user's assignment (for regular users)
app.get('/api/assignment', authenticateToken, async (req, res) => {
    try {
        // Check if assignments exist
        if (!global.currentAssignments || global.currentAssignments.length === 0) {
            return res.status(404).json({ message: 'No assignments have been generated yet' });
        }

        // Filter assignments where current user is the Santa
        const userAssignments = global.currentAssignments.filter(assignment =>
            assignment.santa._id.toString() === req.user.userId.toString()
        );

        if (userAssignments.length === 0) {
            return res.status(404).json({ message: 'No assignment found for you' });
        }

        res.json(userAssignments);
    } catch (error) {
        console.error('Error getting user assignment:', error);
        res.status(500).json({ message: 'Error retrieving assignment' });
    }
});

// Get all assignments (admin only)
app.get('/api/admin/assignments', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // If no current assignments exist or force regenerate is requested, generate new ones
        if (!global.currentAssignments) {
            global.currentAssignments = await generateSantaAssignments();
        }
        res.json(global.currentAssignments);
    } catch (error) {
        console.error('Error getting assignments:', error);
        res.status(500).json({ message: 'Error retrieving assignments' });
    }
});

// Regenerate Santa assignments (admin only)
app.post('/api/admin/assignments/regenerate', authenticateToken, requireAdmin, async (req, res) => {
    try {
        console.log('📌 Regenerate assignments endpoint called');
        const newAssignments = await generateSantaAssignments();
        console.log(`✅ Successfully generated ${newAssignments.length} assignments`);
        res.json(newAssignments);
    } catch (error) {
        console.error('❌ Error regenerating assignments:', error);
        res.status(500).json({
            message: error.message || 'Error regenerating assignments',
            error: error.toString()
        });
    }
});

// Get system statistics (admin only)
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalWishlists = await Wishlist.countDocuments();
        const totalAdmins = await User.countDocuments({ isAdmin: true });
        const totalChildren = await User.countDocuments({ isChild: true });

        res.json({
            totalUsers,
            totalWishlists,
            totalAdmins,
            totalChildren,
            activeUsers: totalUsers - totalAdmins - totalChildren
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Child User Management (Admin only)
// Create child user
app.post('/api/admin/children', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, age, parentUserId } = req.body;

        // Verify parent user exists
        const parentUser = await User.findById(parentUserId);
        if (!parentUser) {
            return res.status(404).json({ message: 'Parent user not found' });
        }

        // Create child user with default password "password"
        const childUser = await User.create({
            name,
            age,
            parentUser: parentUserId,
            isChild: true,
            password: 'password' // Default password for all child users
        });

        // Create empty wishlist for child
        await Wishlist.create({
            user: childUser._id,
            items: []
        });

        res.status(201).json({
            message: 'Child user created successfully',
            childUser
        });
    } catch (error) {
        console.error('Create child user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all child users
app.get('/api/admin/children', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const childUsers = await User.find({ isChild: true })
            .populate('parentUser', 'name email')
            .select('-password');
        res.json(childUsers);
    } catch (error) {
        console.error('Get child users error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update child user
app.put('/api/admin/children/:childId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, age, parentUserId } = req.body;
        const childUser = await User.findOne({ _id: req.params.childId, isChild: true });

        if (!childUser) {
            return res.status(404).json({ message: 'Child user not found' });
        }

        if (parentUserId) {
            const parentUser = await User.findById(parentUserId);
            if (!parentUser) {
                return res.status(404).json({ message: 'Parent user not found' });
            }
            childUser.parentUser = parentUserId;
        }

        if (name) childUser.name = name;
        if (age) childUser.age = age;

        await childUser.save();
        res.json({ message: 'Child user updated successfully', childUser });
    } catch (error) {
        console.error('Update child user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete child user
app.delete('/api/admin/children/:childId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const childUser = await User.findOne({ _id: req.params.childId, isChild: true });

        if (!childUser) {
            return res.status(404).json({ message: 'Child user not found' });
        }

        // Delete child's wishlist
        await Wishlist.deleteOne({ user: childUser._id });

        // Delete child user
        await childUser.deleteOne();

        res.json({ message: 'Child user and associated data deleted successfully' });
    } catch (error) {
        console.error('Delete child user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Cleanup orphaned wishlists (admin only) - removes wishlists for deleted users
app.post('/api/admin/cleanup-wishlists', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Find all wishlists
        const wishlists = await Wishlist.find();
        let deletedCount = 0;

        // Check each wishlist to see if the user exists
        for (const wishlist of wishlists) {
            const userExists = await User.findById(wishlist.user);
            if (!userExists) {
                await Wishlist.deleteOne({ _id: wishlist._id });
                deletedCount++;
                console.log(`Deleted orphaned wishlist for user ID: ${wishlist.user}`);
            }
        }

        res.json({
            message: `Cleanup complete. Removed ${deletedCount} orphaned wishlist(s).`,
            deletedCount
        });
    } catch (error) {
        console.error('Cleanup wishlists error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Cluster Management Routes (Admin only)

// Get all clusters with their members
app.get('/api/admin/clusters', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const users = await User.find({}, 'name cluster isChild');

        // Group users by cluster
        const clusters = {};
        users.forEach(user => {
            const clusterName = user.cluster || 'Unassigned';
            if (!clusters[clusterName]) {
                clusters[clusterName] = [];
            }
            clusters[clusterName].push({
                id: user._id,
                name: user.name,
                isChild: user.isChild
            });
        });

        res.json(clusters);
    } catch (error) {
        console.error('Get clusters error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update user's cluster assignment
app.put('/api/admin/users/:userId/cluster', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { cluster } = req.body;
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Allow null or empty string to remove from cluster
        user.cluster = cluster || null;
        await user.save();

        res.json({
            message: 'User cluster updated successfully',
            user: {
                id: user._id,
                name: user.name,
                cluster: user.cluster
            }
        });
    } catch (error) {
        console.error('Update user cluster error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Bulk update clusters for multiple users
app.post('/api/admin/clusters/bulk-update', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { updates } = req.body; // Array of { userId, cluster }

        if (!Array.isArray(updates)) {
            return res.status(400).json({ message: 'Updates must be an array' });
        }

        const results = [];
        for (const update of updates) {
            const user = await User.findById(update.userId);
            if (user) {
                user.cluster = update.cluster || null;
                await user.save();
                results.push({
                    userId: user._id,
                    name: user.name,
                    cluster: user.cluster,
                    success: true
                });
            } else {
                results.push({
                    userId: update.userId,
                    success: false,
                    error: 'User not found'
                });
            }
        }

        res.json({
            message: 'Bulk cluster update completed',
            results
        });
    } catch (error) {
        console.error('Bulk update clusters error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});