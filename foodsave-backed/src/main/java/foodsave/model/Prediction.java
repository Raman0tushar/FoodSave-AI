package foodsave.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "predictions")
public class Prediction {

    @Id
    private String id;

    // ============================================================
    // BASIC INFORMATION
    // ============================================================

    private String organizationId;

    private LocalDate predictionDate;

    private MealType mealType;

    private Integer expectedCustomers;


    // ============================================================
    // PREDICTION RESULT
    // ============================================================

    private Double predictedDemandKg;

    private Double recommendedPreparationKg;


    // ============================================================
    // PREDICTION CONTEXT
    // ============================================================

    /**
     * Historical food consumption per customer.
     *
     * Example:
     * 0.18 kg/customer
     */
    private Double historicalKgPerCustomer;


    /**
     * Recent food waste percentage.
     *
     * Example:
     * 12.0 means 12% waste.
     */
    private Double recentWasteRate;


    /**
     * Adjustment based on recent waste.
     *
     * Examples:
     * 1.00 = no adjustment
     * 0.98 = reduce predicted demand by 2%
     * 0.95 = reduce predicted demand by 5%
     * 0.92 = reduce predicted demand by 8%
     */
    private Double wasteAdjustment;


    /**
     * Adjustment based on day of week.
     *
     * Example:
     * 1.03 = 3% higher
     * 0.97 = 3% lower
     */
    private Double dayAdjustment;


    // ============================================================
    // CONFIDENCE
    // ============================================================

    /**
     * Prediction confidence as percentage.
     *
     * Example:
     * 78.0 = 78%
     */
    private Double confidence;


    // ============================================================
    // METADATA
    // ============================================================

    private String predictionMethod;

    private LocalDateTime createdAt;
}