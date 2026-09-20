package foodsave.repository;

import foodsave.model.Meal;
import foodsave.model.MealType;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface MealRepository
        extends MongoRepository<Meal, String> {

    List<Meal> findByOrganizationId(String organizationId);

    List<Meal> findByOrganizationIdAndMealDate(
            String organizationId,
            LocalDate mealDate
    );

    List<Meal> findByOrganizationIdAndMealType(
            String organizationId,
            MealType mealType
    );

    List<Meal> findByMealDate(LocalDate mealDate);

    List<Meal> findByOrganizationIdAndMealDateBetween(
            String organizationId,
            LocalDate startDate,
            LocalDate endDate
    );
}