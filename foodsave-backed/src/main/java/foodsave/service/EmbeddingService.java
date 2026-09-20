package foodsave.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmbeddingService {

    @Value("${ollama.url}")
    private String ollamaUrl;

    @Value("${ollama.embedding-model}")
    private String embeddingModel;

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public EmbeddingService(
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper
    ) {
        this.restClient = restClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public List<Double> generateEmbedding(String text) {

        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException(
                    "Text is required for embedding"
            );
        }

        Map<String, Object> body = new HashMap<>();

        body.put("model", embeddingModel);
        body.put("input", text);

        JsonNode response =
                restClient
                        .post()
                        .uri(ollamaUrl + "/api/embed")
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(body)
                        .retrieve()
                        .body(JsonNode.class);

        if (response == null) {
            throw new RuntimeException(
                    "Ollama returned an empty embedding response"
            );
        }

        JsonNode embeddings =
                response.path("embeddings");

        if (!embeddings.isArray() ||
                embeddings.isEmpty()) {

            throw new RuntimeException(
                    "No embedding returned by Ollama"
            );
        }

        JsonNode vector =
                embeddings.get(0);

        return objectMapper.convertValue(
                vector,
                objectMapper.getTypeFactory()
                        .constructCollectionType(
                                List.class,
                                Double.class
                        )
        );
    }
}