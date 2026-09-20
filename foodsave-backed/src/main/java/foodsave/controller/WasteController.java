package foodsave.controller;

import foodsave.model.WasteRecord;
import foodsave.service.WasteService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/waste")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class WasteController {

    private final WasteService wasteService;

    /*
     * Create waste record from meal
     */
    @PostMapping("/meal/{mealId}")
    public ResponseEntity<WasteRecord> createWaste(
            @PathVariable String mealId
    ) {

        return ResponseEntity.ok(
                wasteService.createWasteRecord(mealId)
        );
    }

    /*
     * Get all waste records
     */
    @GetMapping
    public ResponseEntity<List<WasteRecord>> getAllWaste() {

        return ResponseEntity.ok(
                wasteService.getAllWaste()
        );
    }

    /*
     * Get waste for organization
     */
    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<List<WasteRecord>>
    getWasteByOrganization(
            @PathVariable String organizationId
    ) {

        return ResponseEntity.ok(
                wasteService.getWasteByOrganization(
                        organizationId
                )
        );
    }
    // Get Summary
    @GetMapping("/organization/{organizationId}/summary")
    public ResponseEntity<Map<String, Object>> getSummary(
            @PathVariable String organizationId
    ) {

        return ResponseEntity.ok(
                wasteService.getSummary(organizationId)
        );
    }

    /*
     * Get waste by date range
     */
    @GetMapping("/organization/{organizationId}/range")
    public ResponseEntity<List<WasteRecord>>
    getWasteByDateRange(

            @PathVariable String organizationId,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate endDate
    ) {

        return ResponseEntity.ok(
                wasteService.getWasteByDateRange(
                        organizationId,
                        startDate,
                        endDate
                )
        );
    }

    /*
     * Delete waste record
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWaste(
            @PathVariable String id
    ) {

        wasteService.deleteWaste(id);

        return ResponseEntity.noContent().build();
    }
}
