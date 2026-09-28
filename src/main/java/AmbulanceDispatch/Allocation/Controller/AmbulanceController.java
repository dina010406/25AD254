package AmbulanceDispatch.Allocation.Controller;

import AmbulanceDispatch.Allocation.Entity.Ambulance;
import AmbulanceDispatch.Allocation.Service.AmbulanceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ambulances")
public class AmbulanceController {

    private final AmbulanceService service;

    public AmbulanceController(AmbulanceService service) {
        this.service = service;
    }

    @PostMapping
    public Ambulance addAmbulance(@RequestBody Ambulance ambulance) {
        return service.addAmbulance(ambulance);
    }

    @GetMapping
    public List<Ambulance> getAllAmbulances() {
        return service.getAllAmbulances();
    }
}