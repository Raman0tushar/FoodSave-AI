package foodsave.service;

import foodsave.dto.SurplusRequest;
import foodsave.model.DonationStatus;
import foodsave.model.SurplusFood;
import foodsave.repository.SurplusRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SurplusService {

    private final SurplusRepository surplusRepository;

    public SurplusService(SurplusRepository surplusRepository) {
        this.surplusRepository = surplusRepository;
    }

    // ============================================================
    // CREATE SURPLUS
    // ============================================================

    public SurplusFood create(SurplusRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Surplus request cannot be null"
            );
        }

        // Organization validation
        if (request.getOrganizationId() == null
                || request.getOrganizationId().isBlank()) {

            throw new IllegalArgumentException(
                    "organizationId is required"
            );
        }

        // Food name validation
        if (request.getFoodName() == null
                || request.getFoodName().isBlank()) {

            throw new IllegalArgumentException(
                    "foodName is required"
            );
        }

        // Meal type validation
        if (request.getMealType() == null
                || request.getMealType().isBlank()) {

            throw new IllegalArgumentException(
                    "mealType is required"
            );
        }

        // Quantity validation
        if (request.getQuantityKg() == null
                || request.getQuantityKg() <= 0) {

            throw new IllegalArgumentException(
                    "quantityKg must be greater than 0"
            );
        }

        // Portions validation
        if (request.getAvailablePortions() == null
                || request.getAvailablePortions() <= 0) {

            throw new IllegalArgumentException(
                    "availablePortions must be greater than 0"
            );
        }

        // Prepared time validation
        if (request.getPreparedAt() == null) {

            throw new IllegalArgumentException(
                    "preparedAt is required"
            );
        }

        // Expiry validation
        if (request.getAvailableUntil() == null) {

            throw new IllegalArgumentException(
                    "availableUntil is required"
            );
        }

        // Expiry cannot be before preparation
        if (request.getAvailableUntil()
                .isBefore(request.getPreparedAt())) {

            throw new IllegalArgumentException(
                    "Availability expiry cannot be before preparation time"
            );
        }

        // Expiry cannot already be in the past
        if (request.getAvailableUntil()
                .isBefore(LocalDateTime.now())) {

            throw new IllegalArgumentException(
                    "Food availability time has already expired"
            );
        }

        // ========================================================
        // CREATE SURPLUS ENTITY
        // ========================================================

        SurplusFood surplus = SurplusFood.builder()

                .organizationId(
                        request.getOrganizationId()
                )

                .mealId(
                        request.getMealId()
                )

                .mealType(
                        request.getMealType()
                )

                .foodName(
                        request.getFoodName()
                )

                .quantityKg(
                        request.getQuantityKg()
                )

                .availablePortions(
                        request.getAvailablePortions()
                )

                .preparedAt(
                        request.getPreparedAt()
                )

                .availableUntil(
                        request.getAvailableUntil()
                )

                // Safety
                .safetyChecked(false)
                .approvedForDonation(false)

                // NGO
                .ngoId(null)
                .ngoName(null)

                // Initial status
                .status(
                        DonationStatus.PENDING_SAFETY_CHECK
                )

                .createdAt(
                        LocalDateTime.now()
                )

                .donatedAt(null)

                .build();

        return surplusRepository.save(surplus);
    }

    // ============================================================
    // GET ALL
    // ============================================================

    public List<SurplusFood> getAll() {

        expireListings();

        return surplusRepository.findAll();
    }

    // ============================================================
    // GET AVAILABLE FOR DONATION
    // ============================================================

    public List<SurplusFood> getAvailableForDonation() {

        expireListings();

        return surplusRepository.findByStatus(
                DonationStatus.AVAILABLE_FOR_DONATION
        );
    }

    // ============================================================
    // GET BY ORGANIZATION
    // ============================================================

    public List<SurplusFood> getByOrganization(
            String organizationId
    ) {

        if (organizationId == null
                || organizationId.isBlank()) {

            throw new IllegalArgumentException(
                    "organizationId is required"
            );
        }

        expireListings();

        return surplusRepository.findByOrganizationId(
                organizationId
        );
    }

    // ============================================================
    // GET BY ID
    // ============================================================

    public SurplusFood getById(String id) {

        if (id == null || id.isBlank()) {

            throw new IllegalArgumentException(
                    "Surplus listing id is required"
            );
        }

        return surplusRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Surplus food listing not found: "
                                        + id
                        )
                );
    }

    // ============================================================
    // APPROVE FOR DONATION
    // ============================================================

    public SurplusFood approveForDonation(String id) {

        SurplusFood surplus = getById(id);

        if (surplus.getAvailableUntil() == null) {

            throw new IllegalStateException(
                    "Food availability time is missing"
            );
        }

        if (surplus.getAvailableUntil()
                .isBefore(LocalDateTime.now())) {

            surplus.setStatus(
                    DonationStatus.EXPIRED
            );

            return surplusRepository.save(surplus);
        }

        surplus.setSafetyChecked(true);

        surplus.setApprovedForDonation(true);

        surplus.setStatus(
                DonationStatus.AVAILABLE_FOR_DONATION
        );

        return surplusRepository.save(surplus);
    }

    // ============================================================
    // NGO REQUEST
    // ============================================================

    public SurplusFood requestByNGO(
            String id,
            String ngoId,
            String ngoName
    ) {

        SurplusFood surplus = getById(id);

        if (ngoId == null || ngoId.isBlank()) {

            throw new IllegalArgumentException(
                    "ngoId is required"
            );
        }

        if (ngoName == null || ngoName.isBlank()) {

            throw new IllegalArgumentException(
                    "ngoName is required"
            );
        }

        if (surplus.getStatus()
                != DonationStatus.AVAILABLE_FOR_DONATION) {

            throw new IllegalStateException(
                    "Food is not currently available for donation"
            );
        }

        if (!Boolean.TRUE.equals(
                surplus.getApprovedForDonation()
        )) {

            throw new IllegalStateException(
                    "Food has not been approved for donation"
            );
        }

        if (surplus.getAvailableUntil() == null) {

            throw new IllegalStateException(
                    "Food availability time is missing"
            );
        }

        if (surplus.getAvailableUntil()
                .isBefore(LocalDateTime.now())) {

            surplus.setStatus(
                    DonationStatus.EXPIRED
            );

            return surplusRepository.save(surplus);
        }

        surplus.setNgoId(ngoId);

        surplus.setNgoName(ngoName);

        surplus.setStatus(
                DonationStatus.NGO_REQUESTED
        );

        return surplusRepository.save(surplus);
    }

    // ============================================================
    // ACCEPT NGO REQUEST
    // ============================================================

    public SurplusFood acceptNGORequest(String id) {

        SurplusFood surplus = getById(id);

        if (surplus.getStatus()
                != DonationStatus.NGO_REQUESTED) {

            throw new IllegalStateException(
                    "No NGO donation request is pending"
            );
        }

        surplus.setStatus(
                DonationStatus.NGO_ACCEPTED
        );

        return surplusRepository.save(surplus);
    }

    // ============================================================
    // SCHEDULE PICKUP
    // ============================================================

    public SurplusFood schedulePickup(String id) {

        SurplusFood surplus = getById(id);

        if (surplus.getStatus()
                != DonationStatus.NGO_ACCEPTED) {

            throw new IllegalStateException(
                    "NGO request must be accepted before pickup"
            );
        }

        surplus.setStatus(
                DonationStatus.PICKUP_SCHEDULED
        );

        return surplusRepository.save(surplus);
    }

    // ============================================================
    // MARK COLLECTED
    // ============================================================

    public SurplusFood markCollected(String id) {

        SurplusFood surplus = getById(id);

        if (surplus.getStatus()
                != DonationStatus.PICKUP_SCHEDULED) {

            throw new IllegalStateException(
                    "Pickup has not been scheduled"
            );
        }

        surplus.setStatus(
                DonationStatus.COLLECTED
        );

        return surplusRepository.save(surplus);
    }

    // ============================================================
    // MARK DONATED
    // ============================================================

    public SurplusFood markDonated(String id) {

        SurplusFood surplus = getById(id);

        if (surplus.getStatus()
                != DonationStatus.COLLECTED) {

            throw new IllegalStateException(
                    "Food must be collected before marking it donated"
            );
        }

        surplus.setStatus(
                DonationStatus.DONATED
        );

        surplus.setDonatedAt(
                LocalDateTime.now()
        );

        return surplusRepository.save(surplus);
    }

    // ============================================================
    // CANCEL
    // ============================================================

    public SurplusFood cancel(String id) {

        SurplusFood surplus = getById(id);

        if (surplus.getStatus()
                == DonationStatus.DONATED) {

            throw new IllegalStateException(
                    "A completed donation cannot be cancelled"
            );
        }

        surplus.setStatus(
                DonationStatus.CANCELLED
        );

        return surplusRepository.save(surplus);
    }

    // ============================================================
    // EXPIRE LISTINGS
    // ============================================================

    public void expireListings() {

        List<SurplusFood> listings =
                surplusRepository.findAll();

        LocalDateTime now =
                LocalDateTime.now();

        for (SurplusFood surplus : listings) {

            if (surplus.getAvailableUntil() != null
                    && surplus.getAvailableUntil()
                    .isBefore(now)

                    && surplus.getStatus()
                    != DonationStatus.DONATED

                    && surplus.getStatus()
                    != DonationStatus.COLLECTED

                    && surplus.getStatus()
                    != DonationStatus.EXPIRED

                    && surplus.getStatus()
                    != DonationStatus.CANCELLED) {

                surplus.setStatus(
                        DonationStatus.EXPIRED
                );

                surplusRepository.save(surplus);
            }
        }
    }
}