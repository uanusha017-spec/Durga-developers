/**
 * Payload-First Security Rule Verification Suite (Phase 0)
 * Documents the 12 adversarial Dirty Dozen assertions against firestore.rules.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  collection: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  actor: 'anonymous' | 'regular_user' | 'spoofed_unverified_admin' | 'verified_admin';
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_CASES: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Shadow Field Injection on Enquiry Create',
    collection: '/enquiries/enq_shadow_1',
    operation: 'create',
    actor: 'anonymous',
    payload: { type: 'contact', name: 'Test User', phone: '9876543210', status: 'new', isAdmin: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Pre-Closed Status Forgery on Enquiry Create',
    collection: '/enquiries/enq_status_2',
    operation: 'create',
    actor: 'anonymous',
    payload: { type: 'contact', name: 'Test User', phone: '9876543210', status: 'closed' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Forged Timestamp on Enquiry Create',
    collection: '/enquiries/enq_time_3',
    operation: 'create',
    actor: 'anonymous',
    payload: { type: 'contact', name: 'Test User', phone: '9876543210', createdAt: '2020-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'PII Get Enquiry as Non-Admin',
    collection: '/enquiries/enq_existing_4',
    operation: 'get',
    actor: 'regular_user',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'PII List Enquiries as Non-Admin',
    collection: '/enquiries',
    operation: 'list',
    actor: 'regular_user',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Unverified Email Admin Spoofing',
    collection: '/enquiries',
    operation: 'list',
    actor: 'spoofed_unverified_admin',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Unauthorized Property Creation',
    collection: '/properties/prop_unauth_7',
    operation: 'create',
    actor: 'regular_user',
    payload: { name: 'Fake Layout', category: 'Layouts', status: 'Ongoing' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'ID Poisoning on Property Create',
    collection: `/properties/${'a'.repeat(180)}`,
    operation: 'create',
    actor: 'verified_admin',
    payload: { name: 'Valid Name' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Resource Exhaustion String Bomb on Enquiry',
    collection: '/enquiries/enq_bomb_9',
    operation: 'create',
    actor: 'anonymous',
    payload: { message: 'x'.repeat(5000) },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Immutable Field Tampering on Property Update',
    collection: '/properties/prop_10',
    operation: 'update',
    actor: 'verified_admin',
    payload: { createdBy: 'spoofed_uid' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Array Overflow on Property Create',
    collection: '/properties/prop_arr_11',
    operation: 'create',
    actor: 'verified_admin',
    payload: { specifications: Array.from({ length: 25 }, (_, i) => `Spec ${i}`) },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Self-Escalation to Admin Registry',
    collection: '/admins/attacker_uid',
    operation: 'create',
    actor: 'regular_user',
    payload: { email: 'attacker@example.com', role: 'admin' },
    expected: 'PERMISSION_DENIED',
  },
];
