package com.drivexchange.repo;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.drivexchange.entity.TransactionEntity;
import com.drivexchange.entity.TransactionStatus;

public interface TransactionRepository extends JpaRepository<TransactionEntity, UUID> {

    Optional<TransactionEntity> findByRazorpayOrderId(String razorpayOrderId);

    // "scalar" lookups: they return only the car id, NOT a managed entity.
    // We need that to lock the car FIRST and only then load the transaction (see TransactionService).
    @Query("select t.car.id from TransactionEntity t where t.id = :id")
    Optional<UUID> findCarIdById(@Param("id") UUID id);

    @Query("select t.car.id from TransactionEntity t where t.razorpayOrderId = :orderId")
    Optional<UUID> findCarIdByRazorpayOrderId(@Param("orderId") String orderId);

    // the same buyer already has an unpaid, still valid order for this car -> reuse it
    Optional<TransactionEntity> findFirstByCar_IdAndBuyer_IdAndStatusAndExpiresAtAfter(
            UUID carId, UUID buyerId, TransactionStatus status, Instant now);

    List<TransactionEntity> findByCar_IdAndStatusAndExpiresAtBefore(UUID carId, TransactionStatus status, Instant now);

    boolean existsByCar_IdAndStatusIn(UUID carId, Collection<TransactionStatus> statuses);

    // used by "delete my listing": a car that has ever had a deal must be kept, not deleted
    boolean existsByCar_Id(UUID carId);

    // ids only (see the note above) of unpaid orders whose time is up
    @Query("select t.id from TransactionEntity t where t.status = :status and t.expiresAt < :now order by t.expiresAt")
    List<UUID> findIdsByStatusAndExpiresAtBefore(@Param("status") TransactionStatus status,
                                                 @Param("now") Instant now, Pageable pageable);

    // "join fetch" loads car + buyer + seller in ONE query instead of one query per row
    @Query("select t from TransactionEntity t join fetch t.car join fetch t.buyer join fetch t.seller "
            + "where t.buyer.id = :userId order by t.createdAt desc")
    List<TransactionEntity> findBoughtBy(@Param("userId") UUID userId);

    @Query("select t from TransactionEntity t join fetch t.car join fetch t.buyer join fetch t.seller "
            + "where t.seller.id = :userId and t.status in :statuses order by t.createdAt desc")
    List<TransactionEntity> findSoldBy(@Param("userId") UUID userId,
                                       @Param("statuses") Collection<TransactionStatus> statuses);

    @Query("select t from TransactionEntity t join fetch t.car join fetch t.buyer join fetch t.seller "
            + "where t.id = :id")
    Optional<TransactionEntity> findDetailById(@Param("id") UUID id);

    // ---- admin screens ----------------------------------------------------------------------
    // (search text is passed already lower-cased and wrapped like "%abc%"; "%" = no search)

    @EntityGraph(attributePaths = { "car", "buyer", "seller" })
    @Query("select t from TransactionEntity t where lower(coalesce(t.carTitle,'')) like :q "
            + "or lower(t.buyer.name) like :q or lower(t.seller.name) like :q")
    Page<TransactionEntity> adminSearch(@Param("q") String q, Pageable pageable);

    @EntityGraph(attributePaths = { "car", "buyer", "seller" })
    @Query("select t from TransactionEntity t where t.status = :status and (lower(coalesce(t.carTitle,'')) like :q "
            + "or lower(t.buyer.name) like :q or lower(t.seller.name) like :q)")
    Page<TransactionEntity> adminSearchByStatus(@Param("status") TransactionStatus status, @Param("q") String q,
                                                Pageable pageable);

    long countByStatus(TransactionStatus status);

    long countByBuyer_IdOrSeller_Id(UUID buyerId, UUID sellerId);

    List<TransactionEntity> findTop5ByBuyer_IdOrSeller_IdOrderByCreatedAtDesc(UUID buyerId, UUID sellerId);

    /** money we are holding for deals that are not finished yet */
    @Query("select coalesce(sum(t.amountPaise), 0) from TransactionEntity t where t.status in :statuses")
    long sumAmountByStatusIn(@Param("statuses") Collection<TransactionStatus> statuses);
}
