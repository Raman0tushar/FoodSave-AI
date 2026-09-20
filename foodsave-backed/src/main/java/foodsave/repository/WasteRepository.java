package foodsave.repository;

import foodsave.model.MealType;
import foodsave.model.WasteRecord;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface WasteRepository
        extends MongoRepository<WasteRecord, String> {

    List<WasteRecord> findByOrganizationId(
            String organizationId
    );

    List<WasteRecord> findByOrganizationIdAndDate(
            String organizationId,
            LocalDate date
    );

    List<WasteRecord> findByOrganizationIdAndMealType(
            String organizationId,
            MealType mealType
    );

    List<WasteRecord> findByOrganizationIdAndDateBetween(
            String organizationId,
            LocalDate startDate,
            LocalDate endDate
    );

    List<WasteRecord> findByMealId(
            String mealId
    );
}
