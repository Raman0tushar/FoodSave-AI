package foodsave.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import foodsave.dto.AIInsightRequest;
import foodsave.dto.AIInsightResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GraniteAIService {

    @Value("${ollama.url}")
    private String ollamaUrl;

    @Value("${ollama.model}")
    private String model;

    private final RestClient restClient;

    private final ObjectMapper objectMapper;

    public GraniteAIService(
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper
    ) {
        this.restClient = restClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    /**
     * Generate AI explanation and recommendations
     * using IBM Granite through Ollama.
     */
    public AIInsightResponse generateInsight(
            AIInsightRequest request
    ) {

        String prompt = buildPrompt(request);

        Map<String, Object> body = new HashMap<>();

        body.put("model", model);
        body.put("prompt", prompt);
        body.put("stream", false);

        Map<String, Object> options = new HashMap<>();

        options.put("temperature", 0.1);
        options.put("num_predict", 500);

        body.put("options", options);

        JsonNode response =
                restClient
                        .post()
                        .uri(ollamaUrl + "/api/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(body)
                        .retrieve()
                        .body(JsonNode.class);

        if (response == null) {

            throw new RuntimeException(
                    "Ollama returned an empty response"
            );
        }

        String content =
                response
                        .path("response")
                        .asText();

        if (content == null || content.isBlank()) {

            throw new RuntimeException(
                    "Granite returned an empty response"
            );
        }

        return parseGraniteResponse(content);
    }

    /**
     * Build the prompt sent to Granite.
     */
    private String buildPrompt(
            AIInsightRequest request
    ) {

        return """
                You are FoodSave AI, an AI assistant for
                sustainable food management.

                Your job is to explain a numerical food-demand
                prediction and provide practical recommendations
                for reducing avoidable food waste.

                IMPORTANT RULES:

                1. The numerical prediction is already calculated
                   by the FoodSave prediction engine.

                2. Do NOT change the predicted demand.

                3. Do NOT change the recommended preparation
                   quantity.

                4. Do NOT invent missing information.

                5. Do NOT make another numerical prediction.

                6. Recommendations must be practical for a
                   kitchen manager.

                7. Clearly communicate uncertainty.

                8. The human kitchen manager remains the
                   final decision-maker.

                9. Return ONLY valid JSON.

                10. Do NOT use Markdown.

                11. Do NOT wrap the JSON in ```.

                -----------------------------
                FOOD DEMAND DATA
                -----------------------------

                Organization ID:
                %s

                Prediction ID:
                %s

                Meal Type:
                %s

                Expected Customers:
                %d

                Predicted Demand:
                %.2f kg

                Recommended Preparation:
                %.2f kg

                Historical Consumption:
                %.3f kg/customer

                Recent Waste Rate:
                %.2f percent

                Waste Adjustment:
                %.2fx

                Day-of-Week Adjustment:
                %.2fx

                Prediction Confidence:
                %.0f percent

                -----------------------------
                REQUIRED RESPONSE
                -----------------------------

                Return exactly this JSON structure:

                {
                  "explanation": "Explain why this prediction was generated in simple language.",
                  "recommendations": [
                    "Practical recommendation 1",
                    "Practical recommendation 2",
                    "Practical recommendation 3"
                  ],
                  "caution": "Explain the main uncertainty or limitation."
                }

                Keep the explanation concise.

                Do not modify any numerical values.

                Do not add fields outside the requested JSON.
                """.formatted(

                safe(request.getOrganizationId()),

                safe(request.getPredictionId()),

                safe(request.getMealType()),

                safeInteger(request.getExpectedCustomers()),

                safeDouble(request.getPredictedDemandKg()),

                safeDouble(request.getRecommendedPreparationKg()),

                safeDouble(request.getHistoricalKgPerCustomer()),

                safeDouble(request.getRecentWasteRate()),

                safeDouble(request.getWasteAdjustment()),

                safeDouble(request.getDayAdjustment()),

                safeDouble(request.getConfidence())
        );
    }

    /**
     * Parse Granite's JSON response.
     */
    private AIInsightResponse parseGraniteResponse(
            String content
    ) {

        try {

            String cleaned = cleanJson(content);

            AIInsightResponse result =
                    objectMapper.readValue(
                            cleaned,
                            AIInsightResponse.class
                    );

            result.setModel(model);

            if (result.getRecommendations() == null) {

                result.setRecommendations(
                        List.of(
                                "Monitor actual food consumption.",
                                "Compare actual consumption with the prediction.",
                                "Record remaining food for future predictions."
                        )
                );
            }

            return result;

        } catch (Exception e) {

            /*
             * Granite may occasionally return plain text
             * instead of JSON.
             *
             * We keep the original response as the explanation
             * rather than losing the AI result.
             */

            return new AIInsightResponse(

                    content,

                    List.of(
                            "Monitor actual food consumption during the meal.",
                            "Compare actual consumption with the prediction.",
                            "Record remaining food for future predictions."
                    ),

                    "Granite returned an unstructured response. "
                            + "The AI explanation should be treated as advisory.",

                    model
            );
        }
    }

    /**
     * Remove Markdown code fences if Granite returns them.
     */
    private String cleanJson(
            String content
    ) {

        String result = content.trim();

        if (result.startsWith("```json")) {

            result = result.substring(7);

        } else if (result.startsWith("```")) {

            result = result.substring(3);
        }

        if (result.endsWith("```")) {

            result =
                    result.substring(
                            0,
                            result.length() - 3
                    );
        }

        return result.trim();
    }

    private String safe(
            String value
    ) {

        return value == null
                ? "Not provided"
                : value;
    }

    private int safeInteger(
            Integer value
    ) {

        return value == null
                ? 0
                : value;
    }

    private double safeDouble(
            Double value
    ) {

        return value == null
                ? 0.0
                : value;
    }
}