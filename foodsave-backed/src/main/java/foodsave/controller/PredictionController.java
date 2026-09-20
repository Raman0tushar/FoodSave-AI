package foodsave.controller;

import foodsave.dto.PredictionRequest;
import foodsave.dto.PredictionResponse;
import foodsave.model.Prediction;
import foodsave.repository.PredictionRepository;
import foodsave.service.PredictionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PredictionController {

    private final PredictionService predictionService;
    private final PredictionRepository predictionRepository;

    /*
     * Generate prediction
     */
    @PostMapping
    public ResponseEntity<PredictionResponse> predict(
            @Valid @RequestBody PredictionRequest request
    ) {

        return ResponseEntity.ok(
                predictionService.predict(request)
        );
    }

    /*
     * Get all predictions
     */
    @GetMapping
    public ResponseEntity<List<Prediction>> getAllPredictions() {

        return ResponseEntity.ok(
                predictionRepository.findAll()
        );
    }

    /*
     * Get predictions by organization
     */
    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<List<Prediction>>
    getByOrganization(
            @PathVariable String organizationId
    ) {

        return ResponseEntity.ok(
                predictionRepository
                        .findByOrganizationId(
                                organizationId
                        )
        );
    }
}