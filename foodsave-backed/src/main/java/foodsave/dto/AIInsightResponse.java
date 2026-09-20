package foodsave.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIInsightResponse {

    private String explanation;

    private List<String> recommendations;

    private String caution;

    private String model;
}
