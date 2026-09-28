package AmbulanceDispatch.Allocation.Repository;

import AmbulanceDispatch.Allocation.Entity.Zone;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ZoneRepository extends JpaRepository<Zone, Integer> {
}