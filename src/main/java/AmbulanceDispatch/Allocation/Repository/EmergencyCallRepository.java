package AmbulanceDispatch.Allocation.Repository;

import AmbulanceDispatch.Allocation.Entity.EmergencyCall;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmergencyCallRepository
        extends JpaRepository<EmergencyCall, Integer> {
}