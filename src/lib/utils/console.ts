/**
 * Console Helper Functions
 *
 * Provides standardized console output with strict character validation.
 * Used by seeders and server actions to ensure consistent, professional logging.
 *
 * All functions enforce character restrictions:
 * - Allowed: All standard ASCII keyboard characters (a-z, A-Z, 0-9, space, and all keyboard symbols)
 * - NOT allowed: Emojis, unicode symbols, non-ASCII characters
 */

/**
 * Validates that message contains only allowed characters
 * @throws Error if message contains prohibited characters
 */
function validateMessage(message: string): void {
  // Allowed: letters (including Spanish accented), numbers, space, newline, tab, and all standard keyboard symbols
  // Spanish characters: ñÑáéíóúÁÉÍÓÚüÜ
  // Symbols: !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~
  const allowedPattern = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ \n\r\t!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]*$/

  if (!allowedPattern.test(message)) {
    throw new Error(
      `Console message contains prohibited characters. Only standard ASCII keyboard characters are allowed (letters, numbers, space, and keyboard symbols).\nMessage: "${message}"`
    )
  }
}

/**
 * Logs a success message with ballot box prefix
 * Used for successful operations
 * @example logSuccess('Created 5 users')
 */
export function logSuccess(message: string): void {
  validateMessage(message)
  console.log(`[OK] ${message}`)
}

/**
 * Logs a warning message with warning triangle prefix
 * Used for non-critical issues that require attention
 * @example logWarning('No existing groups found, creating defaults')
 */
export function logWarning(message: string): void {
  validateMessage(message)
  console.log(`⚠️ ${message}`)
}

/**
 * Logs an error message with X mark prefix
 * Used for critical failures
 * @example logError('Failed to create parish')
 */
export function logError(message: string): void {
  validateMessage(message)
  console.log(`❌ ${message}`)
}

/**
 * Logs an informational message with no prefix
 * Used for section headers and general information
 * @example logInfo('Creating sample locations...')
 */
export function logInfo(message: string): void {
  validateMessage(message)
  console.log(message)
}
