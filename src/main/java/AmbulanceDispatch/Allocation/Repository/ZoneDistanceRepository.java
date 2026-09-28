package AmbulanceDispatch.Allocation.Repository;

import AmbulanceDispatch.Allocation.Entity.ZoneDistance;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ZoneDistanceRepository extends JpaRepository<ZoneDistance, Integer> {
}