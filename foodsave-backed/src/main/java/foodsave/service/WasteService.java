package foodsave.service;

import foodsave.model.Meal;
import foodsave.model.WasteRecord;
import foodsave.repository.MealRepository;
import foodsave.repository.WasteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WasteService {

    private final WasteRepository wasteRepository;
    private final MealRepository mealRepository;

    /*
     * Create waste record from a meal
     */
    public WasteRecord createWasteRecord(String mealId) {

        Meal meal = mealRepository.findById(mealId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Meal not found with id: " + mealId
                        )
                );

        double prepared =
                meal.getFoodPreparedKg() == null
                        ? 0
                        : meal.getFoodPreparedKg();

        double consumed =
                meal.getFoodConsumedKg() == null
                        ? 0
                        : meal.getFoodConsumedKg();

        double waste = prepared - consumed;

        if (waste < 0) {
            throw new IllegalArgumentException(
                    "Consumed food cannot be greater than prepared food"
            );
        }

        double wastePercentage =
                prepared > 0
                        ? (waste / prepared) * 100
                        : 0;

        WasteRecord record = WasteRecord.builder()
                .organizationId(meal.getOrganizationId())
                .mealId(meal.getId())
                .date(meal.getMealDate())
                .mealType(meal.getMealType())
                .foodPreparedKg(prepared)
                .foodConsumedKg(consumed)
                .foodWasteKg(waste)
                .wastePercentage(wastePercentage)
                .createdAt(LocalDateTime.now())
                .build();

        return wasteRepository.save(record);
    }

    /*
     * Get all waste records
     */
    public List<WasteRecord> getAllWaste() {
        return wasteRepository.findAll();
    }

    /*
     * Get waste by organization
     */
    public List<WasteRecord> getWasteByOrganization(
            String organizationId
    ) {
        return wasteRepository.findByOrganizationId(
                organizationId
        );
    }
   // Waste Analytics Service
    public Map<String, Object> getSummary(
            String organizationId
    ) {

        List<WasteRecord> records =
                wasteRepository.findByOrganizationId(
                        organizationId
                );

        double prepared = records.stream()
                .mapToDouble(r ->
                        r.getFoodPreparedKg() == null
                                ? 0
                                : r.getFoodPreparedKg()
                )
                .sum();

        double consumed = records.stream()
                .mapToDouble(r ->
                        r.getFoodConsumedKg() == null
                                ? 0
                                : r.getFoodConsumedKg()
                )
                .sum();

        double waste = records.stream()
                .mapToDouble(r ->
                        r.getFoodWasteKg() == null
                                ? 0
                                : r.getFoodWasteKg()
                )
                .sum();

        double wastePercentage =
                prepared > 0
                        ? (waste / prepared) * 100
                        : 0;

        double averageWaste =
                records.isEmpty()
                        ? 0
                        : waste / records.size();

        Map<String, Object> result =
                new LinkedHashMap<>();

        result.put("organizationId", organizationId);
        result.put("totalMeals", records.size());
        result.put("totalPreparedKg", round(prepared));
        result.put("totalConsumedKg", round(consumed));
        result.put("totalWasteKg", round(waste));
        result.put("averageWasteKg", round(averageWaste));
        result.put("wastePercentage", round(wastePercentage));

        return result;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    /*
     * Get waste by date range
     */
    public List<WasteRecord> getWasteByDateRange(
            String organizationId,
            java.time.LocalDate startDate,
            java.time.LocalDate endDate
    ) {
        return wasteRepository
                .findByOrganizationIdAndDateBetween(
                        organizationId,
                        startDate,
                        endDate
                );
    }

    /*
     * Delete waste record
     */
    public void deleteWaste(String id) {

        if (!wasteRepository.existsById(id)) {
            throw new RuntimeException(
                    "Waste record not found with id: " + id
            );
        }

        wasteRepository.deleteById(id);
    }
}