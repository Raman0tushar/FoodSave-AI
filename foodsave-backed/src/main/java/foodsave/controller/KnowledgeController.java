package foodsave.controller;

import foodsave.model.KnowledgeDocument;
import foodsave.service.KnowledgeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/knowledge")
@CrossOrigin(origins = "http://localhost:5173")
public class KnowledgeController {

    private final KnowledgeService knowledgeService;

    public KnowledgeController(
            KnowledgeService knowledgeService
    ) {
        this.knowledgeService = knowledgeService;
    }

    // Create knowledge document
    @PostMapping
    public ResponseEntity<KnowledgeDocument> create(
            @RequestBody KnowledgeDocument document
    ) {
        return ResponseEntity.ok(
                knowledgeService.create(document)
        );
    }

    // Get all knowledge documents
    @GetMapping
    public ResponseEntity<List<KnowledgeDocument>> getAll() {
        return ResponseEntity.ok(
                knowledgeService.getAll()
        );
    }

    // Get knowledge document by ID
    @GetMapping("/{id}")
    public ResponseEntity<KnowledgeDocument> getById(
            @PathVariable String id
    ) {
        return ResponseEntity.ok(
                knowledgeService.getById(id)
        );
    }

    // Get documents by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<KnowledgeDocument>> getByCategory(
            @PathVariable String category
    ) {
        return ResponseEntity.ok(
                knowledgeService.getByCategory(category)
        );
    }

    // Get documents by source
    @GetMapping("/source/{source}")
    public ResponseEntity<List<KnowledgeDocument>> getBySource(
            @PathVariable String source
    ) {
        return ResponseEntity.ok(
                knowledgeService.getBySource(source)
        );
    }

    // Get documents by tag
    @GetMapping("/tag/{tag}")
    public ResponseEntity<List<KnowledgeDocument>> getByTag(
            @PathVariable String tag
    ) {
        return ResponseEntity.ok(
                knowledgeService.getByTag(tag)
        );
    }

    // Search documents by title
    @GetMapping("/search")
    public ResponseEntity<List<KnowledgeDocument>> search(
            @RequestParam String title
    ) {
        return ResponseEntity.ok(
                knowledgeService.searchByTitle(title)
        );
    }

    // Delete knowledge document
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable String id
    ) {
        knowledgeService.delete(id);

        return ResponseEntity.noContent().build();
    }
}