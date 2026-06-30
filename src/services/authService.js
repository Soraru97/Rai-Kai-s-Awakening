import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth } from '@/firebase/app'

/**
 * Sign in admin user
 */
export async function signIn(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

/**
 * Sign out current user
 */
export async function signOut() {
  await firebaseSignOut(auth)
}

/**
 * Send password reset email
 */
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email)
}

/**
 * Subscribe to auth state changes
 * @returns {Function} unsubscribe
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback)
}

/**
 * Get current user (synchronous)
 */
export function getCurrentUser() {
  return auth.currentUser
}
