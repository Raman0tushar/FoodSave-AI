package foodsave.service;

import foodsave.exception.ResourceNotFoundException;
import foodsave.model.Organization;
import foodsave.model.OrganizationType;
import foodsave.repository.OrganizationRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrganizationService {

    private final OrganizationRepository repository;

    public OrganizationService(OrganizationRepository repository) {
        this.repository = repository;
    }

    // CREATE
    public Organization createOrganization(Organization organization) {

        if (repository.existsByNameIgnoreCase(organization.getName())) {
            throw new IllegalArgumentException(
                    "Organization with this name already exists"
            );
        }

        organization.setCreatedAt(LocalDateTime.now());

        return repository.save(organization);
    }

    // GET ALL
    public List<Organization> getAllOrganizations() {
        return repository.findAll();
    }

    // GET BY ID
    public Organization getOrganizationById(String id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Organization not found with id: " + id
                        )
                );
    }

    // GET BY TYPE
    public List<Organization> getByType(OrganizationType type) {
        return repository.findByType(type);
    }

    // GET BY CITY
    public List<Organization> getByCity(String city) {
        return repository.findByCityIgnoreCase(city);
    }

    // UPDATE
    public Organization updateOrganization(
            String id,
            Organization updatedOrganization) {

        Organization existing = getOrganizationById(id);

        existing.setName(updatedOrganization.getName());
        existing.setType(updatedOrganization.getType());
        existing.setCity(updatedOrganization.getCity());
        existing.setState(updatedOrganization.getState());
        existing.setCountry(updatedOrganization.getCountry());
        existing.setCapacity(updatedOrganization.getCapacity());

        return repository.save(existing);
    }

    // DELETE
    public void deleteOrganization(String id) {

        Organization existing = getOrganizationById(id);

        repository.delete(existing);
    }
}