package foodsave.repository;

import foodsave.model.KnowledgeDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface KnowledgeDocumentRepository
        extends MongoRepository<KnowledgeDocument, String> {

    List<KnowledgeDocument> findByCategory(String category);

    List<KnowledgeDocument> findBySource(String source);

    List<KnowledgeDocument> findByTagsContaining(String tag);

    List<KnowledgeDocument> findByTitleContainingIgnoreCase(String title);
}