package AmbulanceDispatch.Allocation.Controller;

import AmbulanceDispatch.Allocation.Entity.EmergencyCall;
import AmbulanceDispatch.Allocation.Service.EmergencyCallService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/calls")
public class EmergencyCallController {

    private final EmergencyCallService service;

    public EmergencyCallController(EmergencyCallService service) {
        this.service = service;
    }

    @PostMapping
    public EmergencyCall addCall(@RequestBody EmergencyCall call) {
        return service.addCall(call);
    }

    @GetMapping
    public List<EmergencyCall> getAllCalls() {
        return service.getAllCalls();
    }

    @PutMapping("/{id}/assign")
    public String assignAmbulance(@PathVariable int id) {
        return service.assignAmbulance(id);
    }
    @PutMapping("/{id}/complete")
    public String completeCall(@PathVariable int id) {
        return service.completeCall(id);
    }
}