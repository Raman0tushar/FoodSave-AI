package foodsave.service;

import foodsave.model.KnowledgeDocument;
import foodsave.repository.KnowledgeDocumentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class KnowledgeService {

    private final EmbeddingService embeddingService;

    private final KnowledgeDocumentRepository repository;

    public KnowledgeService(
            KnowledgeDocumentRepository repository,
            EmbeddingService embeddingService
    ) {
        this.repository = repository;
        this.embeddingService = embeddingService;
    }

    // Create a knowledge document
    public KnowledgeDocument create(
            KnowledgeDocument document
    ) {

        if (document.getTitle() == null ||
                document.getTitle().isBlank()) {

            throw new IllegalArgumentException(
                    "Knowledge document title is required"
            );
        }

        if (document.getContent() == null ||
                document.getContent().isBlank()) {

            throw new IllegalArgumentException(
                    "Knowledge document content is required"
            );
        }

        if (document.getCreatedAt() == null) {
            document.setCreatedAt(
                    LocalDateTime.now()
            );
        }

        /*
         * Combine the important searchable information
         * into one semantic text representation.
         */
        String embeddingText =
                buildEmbeddingText(document);

        /*
         * Generate vector using Ollama.
         */
        List<Double> embedding =
                embeddingService.generateEmbedding(
                        embeddingText
                );

        /*
         * Store vector inside MongoDB.
         */
        document.setEmbedding(embedding);

        return repository.save(document);
    }

    private String buildEmbeddingText(
            KnowledgeDocument document
    ) {

        StringBuilder text =
                new StringBuilder();

        text.append("Title: ")
                .append(document.getTitle())
                .append("\n");

        text.append("Category: ")
                .append(document.getCategory())
                .append("\n");

        text.append("Content: ")
                .append(document.getContent())
                .append("\n");

        if (document.getTags() != null &&
                !document.getTags().isEmpty()) {

            text.append("Tags: ")
                    .append(
                            String.join(
                                    ", ",
                                    document.getTags()
                            )
                    )
                    .append("\n");
        }

        return text.toString();
    }


    // Get all knowledge documents
    public List<KnowledgeDocument> getAll() {
        return repository.findAll();
    }

    // Get document by ID
    public KnowledgeDocument getById(String id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Knowledge document not found: " + id
                        )
                );
    }

    // Search by category
    public List<KnowledgeDocument> getByCategory(
            String category
    ) {
        return repository.findByCategory(category);
    }

    // Search by source
    public List<KnowledgeDocument> getBySource(
            String source
    ) {
        return repository.findBySource(source);
    }

    // Search by tag
    public List<KnowledgeDocument> getByTag(
            String tag
    ) {
        return repository.findByTagsContaining(tag);
    }

    // Search by title
    public List<KnowledgeDocument> searchByTitle(
            String title
    ) {
        return repository.findByTitleContainingIgnoreCase(title);
    }

    // Delete document
    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException(
                    "Knowledge document not found: " + id
            );
        }

        repository.deleteById(id);
    }
}