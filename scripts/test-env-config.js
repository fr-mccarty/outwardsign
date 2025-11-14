/**
 * Shared test environment configuration
 *
 * This file defines the dotenv path used by all test setup scripts.
 * Change this constant to switch between local, production, or other environments.
 */

const path = require('path');

// Path to the environment file used for testing
const TEST_ENV_PATH = path.join(__dirname, '..', '.env.local');

module.exports = {
  TEST_ENV_PATH
};
