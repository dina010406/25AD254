package AmbulanceDispatch.Allocation.Service;

import AmbulanceDispatch.Allocation.Entity.Zone;
import AmbulanceDispatch.Allocation.Entity.ZoneDistance;
import AmbulanceDispatch.Allocation.Repository.ZoneRepository;
import AmbulanceDispatch.Allocation.Repository.ZoneDistanceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ZoneService {

    private final ZoneRepository zoneRepository;
    private final ZoneDistanceRepository distanceRepository;

    public ZoneService(ZoneRepository zoneRepository,
                       ZoneDistanceRepository distanceRepository) {
        this.zoneRepository = zoneRepository;
        this.distanceRepository = distanceRepository;
    }

    public Zone addZone(Zone zone) {
        return zoneRepository.save(zone);
    }
    public Zone updateZone(int id, Zone zone) {

        Zone existingZone = zoneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Zone not found"));

        existingZone.setName(zone.getName());

        return zoneRepository.save(existingZone);
    }

    public List<Zone> getAllZones() {
        return zoneRepository.findAll();
    }
    public void deleteZone(int id) {
        zoneRepository.deleteById(id);
    }

    public ZoneDistance addDistance(ZoneDistance distance) {

        Zone fromZone = zoneRepository.findById(distance.getFromZone().getId())
                .orElseThrow(() -> new RuntimeException("From zone not found"));

        Zone toZone = zoneRepository.findById(distance.getToZone().getId())
                .orElseThrow(() -> new RuntimeException("To zone not found"));

        distance.setFromZone(fromZone);
        distance.setToZone(toZone);

        return distanceRepository.save(distance);
    }

    public List<ZoneDistance> getAllDistances() {
        return distanceRepository.findAll();
    }
}