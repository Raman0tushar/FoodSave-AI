package foodsave.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "surplus_food")
public class SurplusFood {

    @Id
    private String id;

    // Organization that has the surplus food
    private String organizationId;

    // Original meal from which the surplus came
    private String mealId;
    private String mealType;

    // Food details
    private String foodName;
    private Double quantityKg;
    private Integer availablePortions;

    // Food timing
    private LocalDateTime preparedAt;
    private LocalDateTime availableUntil;

    // Food safety
    private Boolean safetyChecked;
    private Boolean approvedForDonation;

    // NGO details
    private String ngoId;
    private String ngoName;

    // Donation lifecycle
    private DonationStatus status;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime donatedAt;
}