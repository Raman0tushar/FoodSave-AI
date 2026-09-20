package foodsave.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIInsightRequest {

    private String organizationId;

    private String predictionId;

    private Integer expectedCustomers;

    private String mealType;

    private Double predictedDemandKg;

    private Double recommendedPreparationKg;

    private Double historicalKgPerCustomer;

    private Double recentWasteRate;

    private Double wasteAdjustment;

    private Double dayAdjustment;

    private Double confidence;
}