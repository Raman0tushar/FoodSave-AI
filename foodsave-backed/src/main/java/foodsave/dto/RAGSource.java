package foodsave.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RAGSource {

    private String title;

    private String source;

    private String category;

    private Double score;
}