package foodsave.controller;

import foodsave.dto.RAGRequest;
import foodsave.dto.RAGResponse;
import foodsave.service.RAGService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class RAGController {

    private final RAGService ragService;

    public RAGController(RAGService ragService) {
        this.ragService = ragService;
    }

    @PostMapping("/rag-insight")
    public ResponseEntity<RAGResponse> generateRAGInsight(
            @RequestBody RAGRequest request
    ) {

        RAGResponse response =
                ragService.generateRAGInsight(request);

        return ResponseEntity.ok(response);
    }
}