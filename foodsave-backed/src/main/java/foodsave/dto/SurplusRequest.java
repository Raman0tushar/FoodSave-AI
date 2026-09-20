package foodsave.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SurplusRequest {

    @NotBlank
    private String organizationId;

    private String mealId;

    @NotBlank
    private String mealType;

    @NotBlank
    private String foodName;

    @NotNull
    @Min(1)
    private Double quantityKg;

    @NotNull
    @Min(1)
    private Integer availablePortions;

    @NotNull
    private LocalDateTime preparedAt;

    @NotNull
    private LocalDateTime availableUntil;
}