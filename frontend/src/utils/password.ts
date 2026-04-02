/**
 * Calculate password strength score (0-4).
 * Checks: length >= 8, lowercase, uppercase, digit, special char.
 */
export function getPasswordStrength(password: string): number {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    return score;
}

/**
 * Get human-readable strength label.
 */
export function getPasswordStrengthLabel(score: number): string {
    if (score >= 4) return '强';
    if (score >= 3) return '中';
    if (score >= 2) return '弱';
    return '非常弱';
}
