package foodsave.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import foodsave.dto.RAGRequest;
import foodsave.dto.RAGResponse;
import foodsave.dto.RAGSource;
import foodsave.model.KnowledgeDocument;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RAGService {

    @Value("${ollama.url}")
    private String ollamaUrl;

    @Value("${ollama.model}")
    private String model;

    private static final String VECTOR_INDEX =
            "knowledge_vector_index";

    private static final String COLLECTION =
            "knowledge_documents";

    private final MongoTemplate mongoTemplate;

    private final EmbeddingService embeddingService;

    private final RestClient restClient;

    private final ObjectMapper objectMapper;

    public RAGService(
            MongoTemplate mongoTemplate,
            EmbeddingService embeddingService,
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper
    ) {
        this.mongoTemplate = mongoTemplate;
        this.embeddingService = embeddingService;
        this.restClient = restClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    /**
     * Main RAG pipeline:
     *
     * User Query
     *      ↓
     * Embedding
     *      ↓
     * MongoDB Vector Search
     *      ↓
     * Relevant Documents
     *      ↓
     * Context
     *      ↓
     * Granite
     *      ↓
     * Grounded Response
     */
    public RAGResponse generateRAGInsight(
            RAGRequest request
    ) {

        if (request == null ||
                request.getQuery() == null ||
                request.getQuery().isBlank()) {

            throw new IllegalArgumentException(
                    "Query is required"
            );
        }

        /*
         * STEP 1
         *
         * Convert user query into an embedding.
         */
        List<Double> queryEmbedding =
                embeddingService.generateEmbedding(
                        request.getQuery()
                );

        /*
         * STEP 2
         *
         * Perform MongoDB Atlas Vector Search.
         */
        List<RetrievedDocument> retrievedDocuments =
                vectorSearch(queryEmbedding);

        /*
         * STEP 3
         *
         * Build context from retrieved documents.
         */
        String context =
                buildContext(retrievedDocuments);

        /*
         * STEP 4
         *
         * Send grounded context to Granite.
         */
        String prompt =
                buildPrompt(
                        request,
                        context
                );

        /*
         * STEP 5
         *
         * Generate final answer.
         */
        String answer =
                callGranite(prompt);

        /*
         * STEP 6
         *
         * Convert retrieved documents into
         * source objects for the frontend.
         */
        List<RAGSource> sources =
                retrievedDocuments
                        .stream()
                        .map(item ->
                                new RAGSource(
                                        item.getDocument().getTitle(),
                                        item.getDocument().getSource(),
                                        item.getDocument().getCategory(),
                                        item.getScore()
                                )
                        )
                        .toList();

        return new RAGResponse(
                answer,
                model,
                sources
        );
    }

    /**
     * MongoDB Atlas Vector Search.
     *
     * This uses the MongoDB Java driver directly
     * instead of Spring Aggregation conversion.
     */
    private List<RetrievedDocument> vectorSearch(
            List<Double> queryEmbedding
    ) {

        /*
         * Build $vectorSearch stage.
         */
        Document vectorSearchStage =
                new Document(
                        "$vectorSearch",
                        new Document()
                                .append(
                                        "index",
                                        VECTOR_INDEX
                                )
                                .append(
                                        "path",
                                        "embedding"
                                )
                                .append(
                                        "queryVector",
                                        queryEmbedding
                                )
                                .append(
                                        "numCandidates",
                                        100
                                )
                                .append(
                                        "limit",
                                        5
                                )
                );

        /*
         * Build $project stage.
         *
         * vectorSearchScore is MongoDB's similarity
         * score for the retrieved document.
         */
        Document projectStage =
                new Document(
                        "$project",
                        new Document()
                                .append("_id", 1)
                                .append("title", 1)
                                .append("content", 1)
                                .append("category", 1)
                                .append("source", 1)
                                .append("tags", 1)
                                .append(
                                        "score",
                                        new Document(
                                                "$meta",
                                                "vectorSearchScore"
                                        )
                                )
                );

        /*
         * Execute the native MongoDB aggregation.
         */
        List<Document> results =
                mongoTemplate
                        .getCollection(COLLECTION)
                        .aggregate(
                                List.of(
                                        vectorSearchStage,
                                        projectStage
                                )
                        )
                        .into(
                                new ArrayList<>()
                        );

        /*
         * Convert MongoDB results into
         * RetrievedDocument objects.
         */
        List<RetrievedDocument> retrieved =
                new ArrayList<>();

        for (Document document : results) {

            KnowledgeDocument knowledge =
                    new KnowledgeDocument();

            /*
             * MongoDB _id.
             */
            Object id =
                    document.get("_id");

            if (id != null) {
                knowledge.setId(
                        id.toString()
                );
            }

            /*
             * Knowledge document fields.
             */
            knowledge.setTitle(
                    document.getString("title")
            );

            knowledge.setContent(
                    document.getString("content")
            );

            knowledge.setCategory(
                    document.getString("category")
            );

            knowledge.setSource(
                    document.getString("source")
            );

            /*
             * Vector similarity score.
             */
            Double score = null;

            Object scoreObject =
                    document.get("score");

            if (scoreObject instanceof Number) {

                score =
                        ((Number) scoreObject)
                                .doubleValue();
            }

            retrieved.add(
                    new RetrievedDocument(
                            knowledge,
                            score
                    )
            );
        }

        return retrieved;
    }

    /**
     * Build context for Granite.
     */
    private String buildContext(
            List<RetrievedDocument> documents
    ) {

        if (documents == null ||
                documents.isEmpty()) {

            return "No relevant knowledge was found.";
        }

        return documents
                .stream()
                .limit(5)
                .map(item -> {

                    KnowledgeDocument document =
                            item.getDocument();

                    StringBuilder text =
                            new StringBuilder();

                    text.append("Title: ")
                            .append(
                                    safe(
                                            document.getTitle()
                                    )
                            )
                            .append("\n");

                    text.append("Category: ")
                            .append(
                                    safe(
                                            document.getCategory()
                                    )
                            )
                            .append("\n");

                    text.append("Source: ")
                            .append(
                                    safe(
                                            document.getSource()
                                    )
                            )
                            .append("\n");

                    if (item.getScore() != null) {

                        text.append(
                                        "Similarity Score: "
                                )
                                .append(
                                        String.format(
                                                "%.4f",
                                                item.getScore()
                                        )
                                )
                                .append("\n");
                    }

                    text.append("Content: ")
                            .append(
                                    safe(
                                            document.getContent()
                                    )
                            )
                            .append("\n");

                    return text.toString();
                })
                .collect(
                        Collectors.joining(
                                "\n--------------------\n"
                        )
                );
    }

    /**
     * Prompt sent to IBM Granite.
     */
    private String buildPrompt(
            RAGRequest request,
            String context
    ) {

        return """
                You are FoodSave AI, an AI assistant
                for sustainable food management.

                Answer the user's question using the
                provided knowledge context.

                IMPORTANT RULES:

                1. Use the provided knowledge context
                   as the primary source.

                2. Do not invent facts.

                3. Do not claim information that is
                   not supported by the context.

                4. If the context does not contain
                   enough information, clearly say so.

                5. Do not make a new numerical food
                   demand prediction.

                6. Do not modify existing prediction
                   values.

                7. Give practical recommendations only
                   when supported by the context.

                8. Keep the response concise and clear.

                9. The kitchen manager remains the
                   final decision-maker.

                -----------------------------
                USER QUERY
                -----------------------------

                %s

                -----------------------------
                RETRIEVED KNOWLEDGE
                -----------------------------

                %s

                -----------------------------
                RESPONSE
                -----------------------------

                Answer the user's question using the
                retrieved knowledge above.
                """.formatted(
                request.getQuery(),
                context
        );
    }

    /**
     * Call IBM Granite through Ollama.
     */
    private String callGranite(
            String prompt
    ) {

        Map<String, Object> body =
                new HashMap<>();

        body.put(
                "model",
                model
        );

        body.put(
                "prompt",
                prompt
        );

        body.put(
                "stream",
                false
        );

        Map<String, Object> options =
                new HashMap<>();

        options.put(
                "temperature",
                0.1
        );

        options.put(
                "num_predict",
                400
        );

        body.put(
                "options",
                options
        );

        JsonNode response =
                restClient
                        .post()
                        .uri(
                                ollamaUrl +
                                        "/api/generate"
                        )
                        .contentType(
                                MediaType.APPLICATION_JSON
                        )
                        .body(body)
                        .retrieve()
                        .body(JsonNode.class);

        if (response == null) {

            throw new RuntimeException(
                    "Ollama returned an empty response"
            );
        }

        String generatedResponse =
                response
                        .path("response")
                        .asText();

        if (generatedResponse == null ||
                generatedResponse.isBlank()) {

            throw new RuntimeException(
                    "Granite returned an empty response"
            );
        }

        return generatedResponse.trim();
    }

    private String safe(String value) {

        return value == null
                ? "Not provided"
                : value;
    }

    /**
     * Internal object containing:
     *
     * Knowledge document
     * +
     * Vector similarity score
     */
    private static class RetrievedDocument {

        private final KnowledgeDocument document;

        private final Double score;

        public RetrievedDocument(
                KnowledgeDocument document,
                Double score
        ) {
            this.document = document;
            this.score = score;
        }

        public KnowledgeDocument getDocument() {
            return document;
        }

        public Double getScore() {
            return score;
        }
    }
}