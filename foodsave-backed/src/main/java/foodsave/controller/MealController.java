package foodsave.controller;

import foodsave.model.Meal;
import foodsave.model.MealType;
import foodsave.service.MealService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/meals")
@CrossOrigin(origins = "http://localhost:5173")
public class MealController {

    private final MealService mealService;

    public MealController(MealService mealService) {
        this.mealService = mealService;
    }

    // CREATE
    @PostMapping
    public ResponseEntity<Meal> createMeal(
            @RequestBody Meal meal) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(mealService.createMeal(meal));
    }

    // GET ALL
    @GetMapping
    public ResponseEntity<List<Meal>> getAllMeals() {

        return ResponseEntity.ok(
                mealService.getAllMeals()
        );
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Meal> getMealById(
            @PathVariable String id) {

        return ResponseEntity.ok(
                mealService.getMealById(id)
        );
    }

    // GET BY ORGANIZATION
    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<List<Meal>> getByOrganization(
            @PathVariable String organizationId) {

        return ResponseEntity.ok(
                mealService.getMealsByOrganization(
                        organizationId
                )
        );
    }

    // GET BY ORGANIZATION + DATE
    @GetMapping("/organization/{organizationId}/date")
    public ResponseEntity<List<Meal>> getByOrganizationAndDate(
            @PathVariable String organizationId,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {

        return ResponseEntity.ok(
                mealService.getMealsByOrganizationAndDate(
                        organizationId,
                        date
                )
        );
    }

    // GET BY ORGANIZATION + MEAL TYPE
    @GetMapping("/organization/{organizationId}/type")
    public ResponseEntity<List<Meal>> getByOrganizationAndMealType(
            @PathVariable String organizationId,
            @RequestParam MealType mealType) {

        return ResponseEntity.ok(
                mealService.getMealsByOrganizationAndMealType(
                        organizationId,
                        mealType
                )
        );
    }

    // GET BY DATE RANGE
    @GetMapping("/organization/{organizationId}/range")
    public ResponseEntity<List<Meal>> getByDateRange(
            @PathVariable String organizationId,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate) {

        return ResponseEntity.ok(
                mealService.getMealsByDateRange(
                        organizationId,
                        startDate,
                        endDate
                )
        );
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Meal> updateMeal(
            @PathVariable String id,
            @RequestBody Meal meal) {

        return ResponseEntity.ok(
                mealService.updateMeal(id, meal)
        );
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeal(
            @PathVariable String id) {

        mealService.deleteMeal(id);

        return ResponseEntity.noContent().build();
    }
}