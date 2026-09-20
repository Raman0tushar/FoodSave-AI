package foodsave.dto;

import foodsave.model.MealType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PredictionRequest {

    @NotBlank(message = "organizationId is required")
    private String organizationId;

    @NotNull(message = "predictionDate is required")
    private LocalDate predictionDate;

    @NotNull(message = "mealType is required")
    private MealType mealType;

    @NotNull(message = "expectedCustomers is required")
    @Min(value = 1, message = "expectedCustomers must be at least 1")
    private Integer expectedCustomers;
}