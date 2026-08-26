#!/usr/bin/env node
/** Generate random secrets for production .env */
import crypto from 'crypto';

console.log('\n# Add these to your production .env:\n');
console.log(`JWT_SECRET=${crypto.randomBytes(48).toString('base64url')}`);
console.log(`ENCRYPTION_KEY=${crypto.randomBytes(32).toString('base64url')}`);
console.log('');
