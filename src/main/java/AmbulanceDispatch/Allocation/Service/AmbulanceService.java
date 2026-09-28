package AmbulanceDispatch.Allocation.Service;

import AmbulanceDispatch.Allocation.Entity.Ambulance;
import AmbulanceDispatch.Allocation.Entity.Zone;
import AmbulanceDispatch.Allocation.Repository.AmbulanceRepository;
import AmbulanceDispatch.Allocation.Repository.ZoneRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AmbulanceService {

    private final AmbulanceRepository ambulanceRepository;
    private final ZoneRepository zoneRepository;

    public AmbulanceService(AmbulanceRepository ambulanceRepository,
                            ZoneRepository zoneRepository) {
        this.ambulanceRepository = ambulanceRepository;
        this.zoneRepository = zoneRepository;
    }

    public Ambulance addAmbulance(Ambulance ambulance) {

        Zone zone = zoneRepository.findById(ambulance.getHomeZone().getId())
                .orElseThrow(() -> new RuntimeException("Home zone not found"));

        if (!ambulance.getStatus().equals("AVAILABLE") &&
                !ambulance.getStatus().equals("BUSY")) {
            throw new RuntimeException("Status must be AVAILABLE or BUSY");
        }

        if (ambulanceRepository.findAll().stream()
                .anyMatch(a -> a.getVehicleNumber().equals(ambulance.getVehicleNumber()))) {
            throw new RuntimeException("Vehicle number already exists");
        }

        ambulance.setHomeZone(zone);

        return ambulanceRepository.save(ambulance);
    }

    public List<Ambulance> getAllAmbulances() {
        return ambulanceRepository.findAll();
    }
}