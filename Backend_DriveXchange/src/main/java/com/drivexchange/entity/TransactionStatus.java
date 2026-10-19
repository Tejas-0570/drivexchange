package com.drivexchange.entity;

/**
 * Life of one deal.
 *
 *   CREATED ──pay──▶ PAID_HELD ──buyer confirms delivery──▶ DELIVERED ──admin pays seller──▶ RELEASED
 *      │                 │                                       │
 *      ├─ CANCELLED      └─────────────── DISPUTED ◀─────────────┘
 *      └─ EXPIRED                             │
 *                                         REFUNDED  (money went back to the buyer)
 *
 * Today's code implements CREATED, PAID_HELD, CANCELLED, EXPIRED and REFUNDED (automatic refunds).
 * DELIVERED, RELEASED and DISPUTED are added in the next phase (delivery + admin).
 */
public enum TransactionStatus {
    CREATED,
    PAID_HELD,
    DELIVERED,
    RELEASED,
    REFUNDED,
    DISPUTED,
    CANCELLED,
    EXPIRED
}
