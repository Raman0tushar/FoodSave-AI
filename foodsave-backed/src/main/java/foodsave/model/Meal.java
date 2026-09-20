package foodsave.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "meals")
public class Meal {

    @Id
    private String id;

    private String organizationId;

    private LocalDate mealDate;

    private MealType mealType;

    private List<MenuItem> menu;

    private Integer expectedCustomers;

    private Double foodPreparedKg;

    private Double foodConsumedKg;

    private Double foodWasteKg;

    private Double wasteRate;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}