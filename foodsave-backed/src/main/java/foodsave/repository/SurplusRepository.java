package foodsave.repository;

import foodsave.model.DonationStatus;
import foodsave.model.SurplusFood;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SurplusRepository
        extends MongoRepository<SurplusFood, String> {

    List<SurplusFood> findByOrganizationId(
            String organizationId
    );

    List<SurplusFood> findByStatus(
            DonationStatus status
    );

    List<SurplusFood> findByOrganizationIdAndStatus(
            String organizationId,
            DonationStatus status
    );

    List<SurplusFood> findByNgoId(
            String ngoId
    );

    List<SurplusFood> findByNgoIdAndStatus(
            String ngoId,
            DonationStatus status
    );
}