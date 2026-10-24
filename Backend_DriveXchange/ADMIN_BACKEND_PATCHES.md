# Part C - changes to YOUR existing files (I could not see them, so these are small exact additions)

## 1. CarEntity  - add fields (+ getters/setters)
```java
@Enumerated(EnumType.STRING)
@Column(name = "approval_status", length = 20)
private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;   // new listings wait for admin

@Column(name = "rejection_reason", length = 1000) private String rejectionReason;
@Column(name = "submitted_at")  private Instant submittedAt = Instant.now();
@Column(name = "reviewed_at")   private Instant reviewedAt;
@Column(name = "reviewed_by")   private String reviewedBy;
```
Getters/setters needed: get/setApprovalStatus, get/setRejectionReason, get/setSubmittedAt, get/setReviewedAt, get/setReviewedBy.
(imports: jakarta.persistence.Enumerated, EnumType, java.time.Instant)

## 2. UserEntity - add fields (+ getters/setters)
```java
@Enumerated(EnumType.STRING)
@Column(name = "account_status", length = 20)
private UserStatus status = UserStatus.ACTIVE;

@Column(name = "suspension_reason", length = 1000) private String suspensionReason;
@Column(name = "suspended_at") private Instant suspendedAt;
@Column(name = "created_at", updatable = false) private Instant createdAt = Instant.now();   // skip if you already have one
```
`AdminSupport.rolesOf(...)` calls `u.getRoles()`. If your roles are stored differently, change only that one method.

## 3. CarRepository - add (imports: Page, Pageable, Query, Param, List)
```java
@Query("select c from CarEntity c where c.approvalStatus = :approval and (lower(coalesce(c.title_header,'')) like :q "
     + "or lower(c.vin) like :q or lower(c.user.name) like :q or lower(c.user.email) like :q)")
Page<CarEntity> adminSearch(@Param("approval") ApprovalStatus approval, @Param("q") String q, Pageable pageable);

long countByApprovalStatus(ApprovalStatus status);
long countByUser_Id(UUID userId);
List<CarEntity> findTop5ByUser_IdOrderBySubmittedAtDesc(UUID userId);
```
(findByIdForUpdate must already exist from the payments step.)

## 4. UserRepository - add
```java
@Query("select u from UserEntity u where lower(u.name) like :q or lower(u.email) like :q")
Page<UserEntity> adminSearch(@Param("q") String q, Pageable pageable);

@Query("select u from UserEntity u where u.status = :status and (lower(u.name) like :q or lower(u.email) like :q)")
Page<UserEntity> adminSearchByStatus(@Param("status") UserStatus status, @Param("q") String q, Pageable pageable);

long countByStatus(UserStatus status);
```

## 5. SecurityConfig - one line (extra safety; the services also check)
```java
.requestMatchers("/api/v1/admin/**").hasRole("ADMIN")   // if your authority is "ROLE_ADMIN"
```
If your authorities are named differently use hasAuthority("<your name>"). Put it BEFORE `.anyRequest()`.

## 6. Suspended users (the 3 places)
a) Login service, after the password is correct:
```java
if (user.getStatus() == UserStatus.SUSPENDED)
    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Your account is suspended. Contact support.");
```
b) JWT filter, after you load the user from the token's email (this kills tokens that are already issued):
```java
if (user.getStatus() == UserStatus.SUSPENDED) { response.sendError(403, "Account suspended"); return; }
```
c) `/users/me` response: add `status` (ACTIVE/SUSPENDED) next to roles.

## 7. Normal users - what changes
- list-car service: nothing extra (CarEntity defaults to PENDING + submittedAt = now).
- Browse query AND car-details query (for non-owners): add
  `and c.approvalStatus = com.drivexchange.entity.ApprovalStatus.APPROVED and c.user.status = com.drivexchange.entity.UserStatus.ACTIVE`
  A non-approved car must answer 404 to everyone except its owner.
- Payments: in TransactionService.quote()/create(), also reject a car that is not APPROVED (409 "Car not available").
- my-listings response: add `approvalStatus` and `rejectionReason` to each item.
- Re-submitting a rejected car = the owner lists it again (new row) - nothing else needed.

## 8. Database
Run `admin_migration.sql` ONCE after the app has started (Hibernate adds the new columns first).
Create the first admin: `UPDATE ...` / insert as shown in the same file.
