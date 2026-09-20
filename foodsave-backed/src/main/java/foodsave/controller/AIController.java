package foodsave.controller;

import foodsave.dto.AIInsightRequest;
import foodsave.dto.AIInsightResponse;
import foodsave.service.GraniteAIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AIController {

    private final GraniteAIService graniteAIService;

    public AIController(
            GraniteAIService graniteAIService
    ) {
        this.graniteAIService = graniteAIService;
    }

    @PostMapping("/prediction-insight")
    public ResponseEntity<AIInsightResponse>
    generatePredictionInsight(
            @RequestBody AIInsightRequest request
    ) {

        AIInsightResponse response =
                graniteAIService.generateInsight(request);

        return ResponseEntity.ok(response);
    }
}
