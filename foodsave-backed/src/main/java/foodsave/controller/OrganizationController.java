package foodsave.controller;

import foodsave.model.Organization;
import foodsave.model.OrganizationType;
import foodsave.service.OrganizationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organizations")
@CrossOrigin(origins = "http://localhost:5173")
public class OrganizationController {

    private final OrganizationService service;

    public OrganizationController(OrganizationService service) {
        this.service = service;
    }

    // CREATE
    @PostMapping
    public ResponseEntity<Organization> create(
            @RequestBody Organization organization) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.createOrganization(organization));
    }

    // GET ALL
    @GetMapping
    public ResponseEntity<List<Organization>> getAll() {

        return ResponseEntity.ok(
                service.getAllOrganizations()
        );
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Organization> getById(
            @PathVariable String id) {

        return ResponseEntity.ok(
                service.getOrganizationById(id)
        );
    }

    // GET BY TYPE
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Organization>> getByType(
            @PathVariable OrganizationType type) {

        return ResponseEntity.ok(
                service.getByType(type)
        );
    }

    // GET BY CITY
    @GetMapping("/city/{city}")
    public ResponseEntity<List<Organization>> getByCity(
            @PathVariable String city) {

        return ResponseEntity.ok(
                service.getByCity(city)
        );
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Organization> update(
            @PathVariable String id,
            @RequestBody Organization organization) {

        return ResponseEntity.ok(
                service.updateOrganization(id, organization)
        );
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable String id) {

        service.deleteOrganization(id);

        return ResponseEntity.noContent().build();
    }
}