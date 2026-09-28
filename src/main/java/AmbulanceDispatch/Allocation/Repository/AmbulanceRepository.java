package AmbulanceDispatch.Allocation.Repository;

import AmbulanceDispatch.Allocation.Entity.Ambulance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AmbulanceRepository extends JpaRepository<Ambulance, Integer> {

    List<Ambulance> findByStatus(String status);
}