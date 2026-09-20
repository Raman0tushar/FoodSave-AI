package foodsave.controller;

import foodsave.dto.SurplusRequest;
import foodsave.model.SurplusFood;
import foodsave.service.SurplusService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/surplus")
@CrossOrigin(origins = "http://localhost:5173")
public class SurplusController {

    private final SurplusService surplusService;

    public SurplusController(
            SurplusService surplusService
    ) {
        this.surplusService = surplusService;
    }

    // ------------------------------------------------
    // CREATE SURPLUS FOOD
    // ------------------------------------------------

    @PostMapping
    public ResponseEntity<SurplusFood> create(
            @Valid @RequestBody SurplusRequest request
    ) {

        return ResponseEntity.ok(
                surplusService.create(request)
        );
    }

    // ------------------------------------------------
    // GET ALL SURPLUS FOOD
    // ------------------------------------------------

    @GetMapping
    public ResponseEntity<List<SurplusFood>> getAll() {

        return ResponseEntity.ok(
                surplusService.getAll()
        );
    }

    // ------------------------------------------------
    // GET FOOD AVAILABLE FOR DONATION
    // ------------------------------------------------

    @GetMapping("/available")
    public ResponseEntity<List<SurplusFood>>
    getAvailableForDonation() {

        return ResponseEntity.ok(
                surplusService
                        .getAvailableForDonation()
        );
    }

    // ------------------------------------------------
    // GET SURPLUS BY ORGANIZATION
    // ------------------------------------------------

    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<List<SurplusFood>>
    getByOrganization(
            @PathVariable String organizationId
    ) {

        return ResponseEntity.ok(
                surplusService
                        .getByOrganization(
                                organizationId
                        )
        );
    }

    // ------------------------------------------------
    // GET SURPLUS BY ID
    // ------------------------------------------------

    @GetMapping("/{id}")
    public ResponseEntity<SurplusFood> getById(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                surplusService.getById(id)
        );
    }

    // ------------------------------------------------
    // APPROVE FOOD FOR DONATION
    // ------------------------------------------------

    @PutMapping("/{id}/approve")
    public ResponseEntity<SurplusFood>
    approveForDonation(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                surplusService
                        .approveForDonation(id)
        );
    }

    // ------------------------------------------------
    // NGO REQUESTS FOOD
    // ------------------------------------------------

    @PutMapping("/{id}/request")
    public ResponseEntity<SurplusFood>
    requestByNGO(
            @PathVariable String id,
            @RequestParam String ngoId,
            @RequestParam String ngoName
    ) {

        return ResponseEntity.ok(
                surplusService.requestByNGO(
                        id,
                        ngoId,
                        ngoName
                )
        );
    }

    // ------------------------------------------------
    // ACCEPT NGO REQUEST
    // ------------------------------------------------

    @PutMapping("/{id}/accept")
    public ResponseEntity<SurplusFood>
    acceptNGORequest(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                surplusService.acceptNGORequest(id)
        );
    }

    // ------------------------------------------------
    // SCHEDULE PICKUP
    // ------------------------------------------------

    @PutMapping("/{id}/schedule-pickup")
    public ResponseEntity<SurplusFood>
    schedulePickup(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                surplusService.schedulePickup(id)
        );
    }

    // ------------------------------------------------
    // MARK FOOD AS COLLECTED
    // ------------------------------------------------

    @PutMapping("/{id}/collected")
    public ResponseEntity<SurplusFood>
    markCollected(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                surplusService.markCollected(id)
        );
    }

    // ------------------------------------------------
    // MARK FOOD AS DONATED
    // ------------------------------------------------

    @PutMapping("/{id}/donated")
    public ResponseEntity<SurplusFood>
    markDonated(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                surplusService.markDonated(id)
        );
    }

    // ------------------------------------------------
    // CANCEL DONATION
    // ------------------------------------------------

    @PutMapping("/{id}/cancel")
    public ResponseEntity<SurplusFood>
    cancel(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                surplusService.cancel(id)
        );
    }
}