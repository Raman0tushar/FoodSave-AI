package foodsave.dto;

import foodsave.model.MealType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionResponse {

    private String organizationId;

    private LocalDate predictionDate;

    private MealType mealType;

    private Integer expectedCustomers;

    private Double predictedDemandKg;

    private Double recommendedPreparationKg;

    private Double historicalKgPerCustomer;

    private Double recentWasteRate;

    private Double wasteAdjustment;

    private Double dayAdjustment;

    private Double confidence;

    private String predictionMethod;

    private String explanation;
}