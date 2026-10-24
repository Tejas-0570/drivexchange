# Admin API contract (what the frontend expects)

Every call: header `Authorization: Bearer <token>`. Every response is wrapped: `{ "data": ... }` (your ApiResponse).
**Server must check ROLE_ADMIN on every /api/v1/admin/** call (403 otherwise).** The frontend guard is only cosmetic.
Errors: `{ "message": "..." }` with 403 (not admin), 404, 409 (wrong state, e.g. approving a non-pending listing), 400 (bad input).
Pages: `{ content:[], page:0, size:15, totalElements, totalPages }` (page is 0-based). Query: `page, size, search` + filter below.
Money: listings use rupees (int). Orders use paise (long).

| Method | Path | Notes |
|---|---|---|
| GET | /overview | `{pendingListings, activeListings, totalUsers, suspendedUsers, ordersAwaitingDelivery, payoutsWaiting, openDisputes, heldAmountPaise}` |
| GET | /listings?approval=PENDING\|APPROVED\|REJECTED | row: `{id,title,vin,sellerName,sellerEmail,price,submittedAt,approvalStatus,status,photo}` |
| GET | /listings/{id} | row fields + `brand,model,year,mileage,fuelType,transmission,color,description,photos[],rejectionReason,reviewedAt,reviewedBy,seller{id,name,email,mobile,joinedAt},history[{action,reason,adminName,at}]` |
| POST | /listings/{id}/approve | no body. 409 unless PENDING. Not your own listing. |
| POST | /listings/{id}/reject | `{reason}` (min 5 chars) |
| POST | /listings/{id}/takedown | `{reason}` |
| GET | /users?status=ACTIVE\|SUSPENDED | row: `{id,name,email,mobile,roles[],status,joinedAt,listingsCount,ordersCount}` |
| GET | /users/{id} | row + `suspensionReason,suspendedAt,recentListings[{id,title,price,approvalStatus,status}],recentOrders[{id,carTitle,status,amountPaise,createdAt}]` |
| POST | /users/{id}/suspend | `{reason}`. Not yourself, not an admin. Hides their listings, blocks login + existing tokens. |
| POST | /users/{id}/reactivate | no body |
| GET | /transactions?status=PAID_HELD\|DELIVERED\|DISPUTED\|RELEASED\|REFUNDED | row: `{id,carTitle,buyerName,sellerName,amountPaise,carPricePaise,status,createdAt,paidAt}` |
| GET | /transactions/{id} | `{id,status,carId,carTitle,carPricePaise,amountPaise,platformFeePaise,balanceDuePaise,razorpayOrderId,createdAt,paidAt,deliveredAt,payoutReference,payoutReleasedAt,buyer{id,name,email,mobile},seller{...},payments[{razorpayPaymentId,amountPaise,method,status,failureReason,createdAt}],history[{status,at,by}]}` |
| POST | /transactions/{id}/confirm-delivery | PAID_HELD -> DELIVERED |
| POST | /transactions/{id}/release-payout | `{payoutReference}`; DELIVERED or DISPUTED -> RELEASED |
| POST | /transactions/{id}/refund | `{reason}`; PAID_HELD or DISPUTED -> REFUNDED (call Razorpay refund) |
| GET | /audit-log?targetType=LISTING\|USER\|TRANSACTION | `{id,at,adminName,action,targetType,targetId,reason}` |

Write an audit-log row for every POST above. After any action the frontend refetches, so the response body is ignored.

## Also needed on existing user endpoints (Part B)
- /users/me returns roles (+ status); login rejects suspended users.
- Browse/details hide listings that are not APPROVED, and listings of suspended owners.
- list-car creates with approvalStatus = PENDING; my-listings returns approvalStatus + rejectionReason.
