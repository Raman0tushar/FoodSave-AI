package foodsave.service;

import foodsave.exception.ResourceNotFoundException;
import foodsave.model.Meal;
import foodsave.model.MealType;
import foodsave.repository.MealRepository;
import foodsave.repository.OrganizationRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MealService {

    private final MealRepository mealRepository;
    private final OrganizationRepository organizationRepository;

    public MealService(
            MealRepository mealRepository,
            OrganizationRepository organizationRepository) {

        this.mealRepository = mealRepository;
        this.organizationRepository = organizationRepository;
    }

    // CREATE MEAL
    public Meal createMeal(Meal meal) {

        // Validate organizationId first
        if (meal.getOrganizationId() == null ||
                meal.getOrganizationId().isBlank()) {

            throw new IllegalArgumentException(
                    "organizationId is required"
            );
        }

        // Check organization exists
        organizationRepository.findById(meal.getOrganizationId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Organization not found with id: "
                                        + meal.getOrganizationId()
                        )
                );

        validateMealData(meal);

        calculateWaste(meal);

        meal.setCreatedAt(LocalDateTime.now());
        meal.setUpdatedAt(LocalDateTime.now());

        return mealRepository.save(meal);
    }

    //Valid Meal Data
    private void validateMealData(Meal meal) {

        if (meal.getMealDate() == null) {
            throw new IllegalArgumentException(
                    "mealDate is required"
            );
        }

        if (meal.getMealType() == null) {
            throw new IllegalArgumentException(
                    "mealType is required"
            );
        }

        if (meal.getExpectedCustomers() == null ||
                meal.getExpectedCustomers() < 0) {

            throw new IllegalArgumentException(
                    "expectedCustomers must be >= 0"
            );
        }

        validateFoodValues(meal);
    }




    // GET ALL MEALS
    public List<Meal> getAllMeals() {

        return mealRepository.findAll();
    }

    // GET MEAL BY ID
    public Meal getMealById(String id) {

        return mealRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Meal not found with id: " + id
                        )
                );
    }

    // GET MEALS BY ORGANIZATION
    public List<Meal> getMealsByOrganization(
            String organizationId) {

        organizationRepository.findById(organizationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Organization not found with id: "
                                        + organizationId
                        )
                );

        return mealRepository
                .findByOrganizationId(organizationId);
    }

    // GET BY ORGANIZATION + DATE
    public List<Meal> getMealsByOrganizationAndDate(
            String organizationId,
            LocalDate date) {

        return mealRepository
                .findByOrganizationIdAndMealDate(
                        organizationId,
                        date
                );
    }

    // GET BY ORGANIZATION + MEAL TYPE
    public List<Meal> getMealsByOrganizationAndMealType(
            String organizationId,
            MealType mealType) {

        return mealRepository
                .findByOrganizationIdAndMealType(
                        organizationId,
                        mealType
                );
    }

    // GET BY DATE RANGE
    public List<Meal> getMealsByDateRange(
            String organizationId,
            LocalDate startDate,
            LocalDate endDate) {

        return mealRepository
                .findByOrganizationIdAndMealDateBetween(
                        organizationId,
                        startDate,
                        endDate
                );
    }

    // UPDATE
    public Meal updateMeal(
            String id,
            Meal updatedMeal) {

        Meal existingMeal = getMealById(id);

        if (updatedMeal.getOrganizationId() != null) {

            organizationRepository
                    .findById(updatedMeal.getOrganizationId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Organization not found with id: "
                                            + updatedMeal.getOrganizationId()
                            )
                    );

            existingMeal.setOrganizationId(
                    updatedMeal.getOrganizationId()
            );
        }

        existingMeal.setMealDate(
                updatedMeal.getMealDate()
        );

        existingMeal.setMealType(
                updatedMeal.getMealType()
        );

        existingMeal.setMenu(
                updatedMeal.getMenu()
        );

        existingMeal.setExpectedCustomers(
                updatedMeal.getExpectedCustomers()
        );

        existingMeal.setFoodPreparedKg(
                updatedMeal.getFoodPreparedKg()
        );

        existingMeal.setFoodConsumedKg(
                updatedMeal.getFoodConsumedKg()
        );

        validateFoodValues(existingMeal);

        calculateWaste(existingMeal);

        existingMeal.setUpdatedAt(
                LocalDateTime.now()
        );

        return mealRepository.save(existingMeal);
    }

    // DELETE
    public void deleteMeal(String id) {

        Meal meal = getMealById(id);

        mealRepository.delete(meal);
    }

    // CALCULATE WASTE
    private void calculateWaste(Meal meal) {

        double prepared = meal.getFoodPreparedKg();
        double consumed = meal.getFoodConsumedKg();

        double waste = prepared - consumed;

        double wasteRate = 0;

        if (prepared > 0) {
            wasteRate = (waste / prepared) * 100;
        }

        meal.setFoodWasteKg(
                Math.round(waste * 100.0) / 100.0
        );

        meal.setWasteRate(
                Math.round(wasteRate * 100.0) / 100.0
        );
    }

    // VALIDATION
    private void validateFoodValues(Meal meal) {

        if (meal.getFoodPreparedKg() == null ||
                meal.getFoodPreparedKg() < 0) {

            throw new IllegalArgumentException(
                    "Food prepared must be >= 0"
            );
        }

        if (meal.getFoodConsumedKg() == null ||
                meal.getFoodConsumedKg() < 0) {

            throw new IllegalArgumentException(
                    "Food consumed must be >= 0"
            );
        }

        if (meal.getFoodConsumedKg()
                > meal.getFoodPreparedKg()) {

            throw new IllegalArgumentException(
                    "Food consumed cannot be greater than food prepared"
            );
        }

        if (meal.getExpectedCustomers() == null ||
                meal.getExpectedCustomers() < 0) {

            throw new IllegalArgumentException(
                    "Expected customers must be >= 0"
            );
        }
    }
}