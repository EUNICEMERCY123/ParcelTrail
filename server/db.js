// Database connection setup using Mongoose and dotenv (Module 5 & 6)
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables from server/.env, falling back to repo root .env
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const TEST_DB_NAME = 'parceltrail_test';
const PROD_DB_NAMES = new Set(['parceltrail', 'admin', 'local', 'config']);

function getDatabaseName(uri) {
  if (!uri || typeof uri !== 'string') return '';
  try {
    const parsed = new URL(uri);
    return parsed.pathname.replace(/^\/+/, '').split('/')[0] || '';
  } catch {
    const [base] = uri.split('?');
    const match = base.match(/^mongodb(?:\+srv)?:\/\/[^/]+(?:\/([^?]*))?$/i);
    if (!match || !match[1]) return '';
    return match[1].replace(/^\/+/, '').split('/')[0] || '';
  }
}

function getNormalizedTarget(uri) {
  if (!uri || typeof uri !== 'string') return '';
  const dbName = getDatabaseName(uri).toLowerCase();
  const [base] = uri.split('?');
  const hostMatch = base.match(/^mongodb(?:\+srv)?:\/\/(?:[^@/]+@)?([^/]+)/i);
  const hosts = hostMatch ? hostMatch[1].toLowerCase() : '';
  return hosts && dbName ? `${hosts}/${dbName}` : dbName;
}

function assertSafeTestUri(testUri, prodUri) {
  const testDb = getDatabaseName(testUri);
  if (!testDb) {
    throw new Error('Unsafe MONGODB_TEST_URI: must specify an explicit test database name (e.g. parceltrail_test).');
  }
  if (PROD_DB_NAMES.has(testDb.toLowerCase())) {
    throw new Error(`Unsafe MONGODB_TEST_URI: refusing to target protected or production database "${testDb}".`);
  }
  if (prodUri && getNormalizedTarget(testUri) === getNormalizedTarget(prodUri)) {
    throw new Error(`Unsafe MONGODB_TEST_URI: test URI targets the same database ("${testDb}") as MONGODB_URI.`);
  }
  return testUri;
}

function withDatabaseName(uri, dbName) {
  if (!uri) return `mongodb://127.0.0.1:27017/${dbName}`;
  try {
    const parsed = new URL(uri);
    parsed.pathname = `/${dbName}`;
    return parsed.toString();
  } catch {
    const [base, query] = uri.split('?');
    const match = base.match(/^(mongodb(?:\+srv)?:\/\/[^/]+)(?:\/[^?]*)?$/i);
    if (!match) return uri;
    return `${match[1]}/${dbName}${query ? `?${query}` : ''}`;
  }
}

function resolveMongoUri() {
  if (process.env.NODE_ENV === 'test') {
    if (process.env.MONGODB_TEST_URI) {
      return assertSafeTestUri(process.env.MONGODB_TEST_URI, process.env.MONGODB_URI);
    }
    if (process.env.MONGODB_URI) {
      return withDatabaseName(process.env.MONGODB_URI, TEST_DB_NAME);
    }
    return `mongodb://127.0.0.1:27017/${TEST_DB_NAME}`;
  }
  return process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/parcelTrail';
}

let connectionPromise = null;

// Connects to MongoDB database with Mongoose
async function connectDB({ exitOnError = true } = {}) {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (connectionPromise) {
    return connectionPromise;
  }

  let mongoUri;
  try {
    mongoUri = resolveMongoUri();
  } catch (error) {
    console.error('[MongoDB] Configuration safety error:', error.message);
    if (exitOnError) {
      process.exit(1);
    }
    return Promise.reject(error);
  }
  connectionPromise = mongoose
    .connect(mongoUri, { serverSelectionTimeoutMS: 10000 })
    .then(() => {
      console.log(`[MongoDB] Connected to database (${mongoose.connection.name || 'default'})`);
      return mongoose.connection;
    })
    .catch((error) => {
      connectionPromise = null;
      console.error('[MongoDB] Connection failure:', error.message);
      if (!process.env.MONGODB_URI && process.env.NODE_ENV !== 'test') {
        console.error('[MongoDB] Hint: Set MONGODB_URI in server/.env (see server/.env.example).');
      }
      if (exitOnError) {
        process.exit(1);
      }
      throw error;
    });

  return connectionPromise;
}

module.exports = { connectDB, mongoose, resolveMongoUri, withDatabaseName, assertSafeTestUri, getDatabaseName, TEST_DB_NAME };
