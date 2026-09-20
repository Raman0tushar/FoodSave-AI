package foodsave.repository;

import foodsave.model.Organization;
import foodsave.model.OrganizationType;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface OrganizationRepository
        extends MongoRepository<Organization, String> {

    List<Organization> findByType(OrganizationType type);

    List<Organization> findByCityIgnoreCase(String city);

    boolean existsByNameIgnoreCase(String name);
}