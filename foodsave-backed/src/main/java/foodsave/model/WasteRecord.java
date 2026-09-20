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
@Document(collection = "waste_records")
public class WasteRecord {

    @Id
    private String id;

    private String organizationId;

    private String mealId;

    private LocalDate date;

    private MealType mealType;

    private Double foodPreparedKg;

    private Double foodConsumedKg;

    private Double foodWasteKg;

    private Double wastePercentage;

    private LocalDateTime createdAt;
}