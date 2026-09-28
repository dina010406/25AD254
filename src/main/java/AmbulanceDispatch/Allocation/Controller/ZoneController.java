package AmbulanceDispatch.Allocation.Controller;

import AmbulanceDispatch.Allocation.Entity.Zone;
import AmbulanceDispatch.Allocation.Entity.ZoneDistance;
import AmbulanceDispatch.Allocation.Service.ZoneService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/zones")
public class ZoneController {

    private final ZoneService service;

    public ZoneController(ZoneService service) {
        this.service = service;
    }

    @PostMapping
    public Zone addZone(@RequestBody Zone zone) {
        return service.addZone(zone);
    }

    @GetMapping
    public List<Zone> getAllZones() {
        return service.getAllZones();
    }

    @PostMapping("/distance")
    public ZoneDistance addDistance(@RequestBody ZoneDistance distance) {
        return service.addDistance(distance);
    }

    @GetMapping("/distance")
    public List<ZoneDistance> getAllDistances() {
        return service.getAllDistances();
    }

    @DeleteMapping("/{id}")
    public String deleteZone(@PathVariable int id) {
        service.deleteZone(id);
        return "Zone deleted successfully";
    }
}