package foodsave.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RAGResponse {

    private String response;

    private String model;

    private List<RAGSource> sources;
}