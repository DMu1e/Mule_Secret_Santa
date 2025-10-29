require('dotenv').config();
const fetch = require('node-fetch');

async function createAdminUser() {
    try {
        const response = await fetch('http://localhost:3000/api/create-admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                adminSecret: process.env.ADMIN_SECRET || 'admin-secret-key'
            })
        });

        const data = await response.json();
        console.log(data.message);
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
}

createAdminUser();