package foodsave.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RAGRequest {

    private String organizationId;

    private String predictionId;

    private String query;
}