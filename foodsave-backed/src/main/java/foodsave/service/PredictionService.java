package foodsave.service;

import foodsave.dto.PredictionRequest;
import foodsave.dto.PredictionResponse;
import foodsave.model.Meal;
import foodsave.model.Prediction;
import foodsave.repository.MealRepository;
import foodsave.repository.OrganizationRepository;
import foodsave.repository.PredictionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PredictionService {

    private final PredictionRepository predictionRepository;
    private final MealRepository mealRepository;
    private final OrganizationRepository organizationRepository;


    // ============================================================
    // CREATE PREDICTION
    // ============================================================

    public PredictionResponse predict(
            PredictionRequest request
    ) {

        validateOrganization(
                request.getOrganizationId()
        );


        // ========================================================
        // GET HISTORICAL MEALS
        // ========================================================

        List<Meal> historicalMeals =
                mealRepository.findByOrganizationId(
                        request.getOrganizationId()
                );


        /*
         * Only use:
         *
         * 1. Same meal type
         * 2. Existing consumption data
         * 3. Existing expected customer data
         * 4. Historical dates only
         */

        List<Meal> relevantMeals =
                historicalMeals.stream()
                        .filter(meal ->
                                meal.getMealType()
                                        == request.getMealType()
                        )
                        .filter(meal ->
                                meal.getFoodConsumedKg() != null
                        )
                        .filter(meal ->
                                meal.getExpectedCustomers() != null
                        )
                        .filter(meal ->
                                meal.getExpectedCustomers() > 0
                        )
                        .filter(meal ->
                                meal.getMealDate() != null
                        )
                        .filter(meal ->
                                !meal.getMealDate()
                                        .isAfter(
                                                request.getPredictionDate()
                                        )
                        )
                        .toList();


        // ========================================================
        // HISTORICAL KG PER CUSTOMER
        // ========================================================

        double historicalKgPerCustomer =
                calculateAverageConsumptionPerCustomer(
                        relevantMeals
                );


        /*
         * If there is not enough historical data,
         * use a conservative baseline.
         */

        if (historicalKgPerCustomer <= 0) {

            historicalKgPerCustomer = 0.20;

        }


        // ========================================================
        // RECENT WASTE RATE
        // ========================================================

        double recentWasteRate =
                calculateRecentWasteRate(
                        relevantMeals,
                        request.getPredictionDate()
                );


        // ========================================================
        // WASTE ADJUSTMENT
        // ========================================================

        double wasteAdjustment =
                calculateWasteAdjustment(
                        recentWasteRate
                );


        // ========================================================
        // DAY OF WEEK ADJUSTMENT
        // ========================================================

        double dayAdjustment =
                calculateDayAdjustment(
                        relevantMeals,
                        request.getPredictionDate()
                );


        // ========================================================
        // BASE DEMAND
        // ========================================================

        double baseDemand =
                request.getExpectedCustomers()
                        * historicalKgPerCustomer;


        // ========================================================
        // FINAL PREDICTED DEMAND
        // ========================================================

        double predictedDemand =
                baseDemand
                        * wasteAdjustment
                        * dayAdjustment;


        // ========================================================
        // RECOMMENDED PREPARATION
        // ========================================================

        /*
         * Add 5% operational safety margin.
         */

        double recommendedPreparation =
                predictedDemand * 1.05;


        // ========================================================
        // CONFIDENCE
        // ========================================================

        double confidence =
                calculateConfidence(
                        relevantMeals.size(),
                        recentWasteRate
                );


        // ========================================================
        // PREDICTION METHOD
        // ========================================================

        String predictionMethod =
                "Historical Consumption + Waste + Day-of-Week Adjustment";


        // ========================================================
        // SAVE PREDICTION
        // ========================================================

        Prediction prediction =
                Prediction.builder()

                        .organizationId(
                                request.getOrganizationId()
                        )

                        .predictionDate(
                                request.getPredictionDate()
                        )

                        .mealType(
                                request.getMealType()
                        )

                        .expectedCustomers(
                                request.getExpectedCustomers()
                        )

                        .predictedDemandKg(
                                round(predictedDemand)
                        )

                        .recommendedPreparationKg(
                                round(recommendedPreparation)
                        )

                        .historicalKgPerCustomer(
                                round(historicalKgPerCustomer)
                        )

                        .recentWasteRate(
                                round(recentWasteRate)
                        )

                        .wasteAdjustment(
                                round(wasteAdjustment)
                        )

                        .dayAdjustment(
                                round(dayAdjustment)
                        )

                        .confidence(
                                round(confidence)
                        )

                        .predictionMethod(
                                predictionMethod
                        )

                        .createdAt(
                                LocalDateTime.now()
                        )

                        .build();


        predictionRepository.save(prediction);


        // ========================================================
        // EXPLANATION
        // ========================================================

        String explanation =
                buildExplanation(
                        relevantMeals.size(),
                        historicalKgPerCustomer,
                        recentWasteRate,
                        wasteAdjustment,
                        dayAdjustment,
                        predictedDemand,
                        recommendedPreparation,
                        confidence
                );


        // ========================================================
        // RESPONSE
        // ========================================================

        return PredictionResponse.builder()

                .organizationId(
                        request.getOrganizationId()
                )

                .predictionDate(
                        request.getPredictionDate()
                )

                .mealType(
                        request.getMealType()
                )

                .expectedCustomers(
                        request.getExpectedCustomers()
                )

                .predictedDemandKg(
                        round(predictedDemand)
                )

                .recommendedPreparationKg(
                        round(recommendedPreparation)
                )

                .confidence(
                        round(confidence)
                )

                .predictionMethod(
                        predictionMethod
                )

                .explanation(
                        explanation
                )

                .build();
    }


    // ============================================================
    // HISTORICAL CONSUMPTION PER CUSTOMER
    // ============================================================

    private double calculateAverageConsumptionPerCustomer(
            List<Meal> meals
    ) {

        if (meals.isEmpty()) {
            return 0;
        }


        double totalConsumption = 0;

        int totalCustomers = 0;


        for (Meal meal : meals) {

            Double consumed =
                    meal.getFoodConsumedKg();

            Integer customers =
                    meal.getExpectedCustomers();


            if (consumed == null ||
                    customers == null ||
                    customers <= 0) {

                continue;

            }


            totalConsumption += consumed;

            totalCustomers += customers;
        }


        if (totalCustomers == 0) {
            return 0;
        }


        return totalConsumption /
                totalCustomers;
    }


    // ============================================================
    // RECENT WASTE RATE
    // ============================================================

    private double calculateRecentWasteRate(
            List<Meal> meals,
            LocalDate predictionDate
    ) {

        LocalDate startDate =
                predictionDate.minusDays(30);


        double totalPrepared = 0;

        double totalWaste = 0;


        for (Meal meal : meals) {

            if (meal.getMealDate() == null) {
                continue;
            }


            if (meal.getMealDate()
                    .isBefore(startDate)) {

                continue;
            }


            if (meal.getMealDate()
                    .isAfter(predictionDate)) {

                continue;
            }


            Double prepared =
                    meal.getFoodPreparedKg();

            Double waste =
                    meal.getFoodWasteKg();


            /*
             * If wasteKg is not available,
             * calculate it from prepared - consumed.
             */

            if (waste == null &&
                    prepared != null &&
                    meal.getFoodConsumedKg() != null) {

                waste =
                        prepared -
                                meal.getFoodConsumedKg();

            }


            if (prepared == null ||
                    prepared <= 0 ||
                    waste == null) {

                continue;

            }


            totalPrepared += prepared;

            totalWaste += Math.max(
                    0,
                    waste
            );
        }


        if (totalPrepared <= 0) {
            return 0;
        }


        return (
                totalWaste /
                        totalPrepared
        ) * 100.0;
    }


    // ============================================================
    // WASTE ADJUSTMENT
    // ============================================================

    private double calculateWasteAdjustment(
            double wasteRate
    ) {

        /*
         * High historical waste means
         * prepare slightly less.
         */

        if (wasteRate >= 20) {
            return 0.92;
        }


        if (wasteRate >= 15) {
            return 0.95;
        }


        if (wasteRate >= 10) {
            return 0.98;
        }


        return 1.00;
    }


    // ============================================================
    // DAY OF WEEK ADJUSTMENT
    // ============================================================

    private double calculateDayAdjustment(
            List<Meal> meals,
            LocalDate predictionDate
    ) {

        if (meals.isEmpty()) {
            return 1.00;
        }


        DayOfWeek targetDay =
                predictionDate.getDayOfWeek();


        double targetDayConsumption = 0;

        int targetDayCustomers = 0;


        double overallConsumption = 0;

        int overallCustomers = 0;


        for (Meal meal : meals) {

            if (meal.getMealDate() == null ||
                    meal.getFoodConsumedKg() == null ||
                    meal.getExpectedCustomers() == null ||
                    meal.getExpectedCustomers() <= 0) {

                continue;
            }


            double consumed =
                    meal.getFoodConsumedKg();

            int customers =
                    meal.getExpectedCustomers();


            overallConsumption += consumed;

            overallCustomers += customers;


            if (meal.getMealDate()
                    .getDayOfWeek()
                    == targetDay) {

                targetDayConsumption += consumed;

                targetDayCustomers += customers;
            }
        }


        /*
         * Not enough information for
         * day-of-week adjustment.
         */

        if (overallCustomers == 0 ||
                targetDayCustomers == 0) {

            return 1.00;
        }


        double overallKgPerCustomer =
                overallConsumption /
                        overallCustomers;


        double targetDayKgPerCustomer =
                targetDayConsumption /
                        targetDayCustomers;


        if (overallKgPerCustomer <= 0) {
            return 1.00;
        }


        double adjustment =
                targetDayKgPerCustomer /
                        overallKgPerCustomer;


        /*
         * Prevent extreme adjustments.
         */

        return Math.max(
                0.90,
                Math.min(
                        1.10,
                        adjustment
                )
        );
    }


    // ============================================================
    // CONFIDENCE
    // ============================================================

    private double calculateConfidence(
            int historicalRecords,
            double recentWasteRate
    ) {

        double confidence;


        if (historicalRecords >= 30) {

            confidence = 90;

        } else if (historicalRecords >= 20) {

            confidence = 85;

        } else if (historicalRecords >= 10) {

            confidence = 78;

        } else if (historicalRecords >= 5) {

            confidence = 68;

        } else if (historicalRecords >= 1) {

            confidence = 55;

        } else {

            confidence = 40;
        }


        /*
         * Very high waste introduces
         * additional uncertainty.
         */

        if (recentWasteRate > 20) {

            confidence -= 5;

        }


        return Math.max(
                30,
                Math.min(
                        90,
                        confidence
                )
        );
    }


    // ============================================================
    // EXPLANATION
    // ============================================================

    private String buildExplanation(
            int records,
            double kgPerCustomer,
            double wasteRate,
            double wasteAdjustment,
            double dayAdjustment,
            double demand,
            double preparation,
            double confidence
    ) {

        return String.format(

                "FoodSave AI analyzed %d historical matching "
                        + "meal records. Historical consumption is "
                        + "%.3f kg per customer. Recent waste rate "
                        + "is %.2f%%, producing a waste adjustment "
                        + "of %.2f. The day-of-week adjustment is "
                        + "%.2f. Predicted demand is %.2f kg and "
                        + "recommended preparation is %.2f kg "
                        + "including a 5%% operational safety margin. "
                        + "Prediction confidence is %.0f%%.",

                records,

                kgPerCustomer,

                wasteRate,

                wasteAdjustment,

                dayAdjustment,

                demand,

                preparation,

                confidence
        );
    }


    // ============================================================
    // VALIDATE ORGANIZATION
    // ============================================================

    private void validateOrganization(
            String organizationId
    ) {

        if (organizationId == null ||
                organizationId.isBlank()) {

            throw new IllegalArgumentException(
                    "organizationId is required"
            );
        }


        if (!organizationRepository.existsById(
                organizationId
        )) {

            throw new IllegalArgumentException(
                    "Organization not found: "
                            + organizationId
            );
        }
    }


    // ============================================================
    // ROUND
    // ============================================================

    private double round(double value) {

        return Math.round(
                value * 100.0
        ) / 100.0;
    }
}