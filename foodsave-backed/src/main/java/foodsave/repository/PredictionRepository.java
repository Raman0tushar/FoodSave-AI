package foodsave.repository;

import foodsave.model.MealType;
import foodsave.model.Prediction;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface PredictionRepository
        extends MongoRepository<Prediction, String> {

    List<Prediction> findByOrganizationId(
            String organizationId
    );

    List<Prediction> findByOrganizationIdAndPredictionDate(
            String organizationId,
            LocalDate predictionDate
    );

    List<Prediction> findByOrganizationIdAndMealType(
            String organizationId,
            MealType mealType
    );
}