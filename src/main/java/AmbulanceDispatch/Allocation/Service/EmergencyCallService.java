package AmbulanceDispatch.Allocation.Service;

import AmbulanceDispatch.Allocation.Entity.Ambulance;
import AmbulanceDispatch.Allocation.Entity.EmergencyCall;
import AmbulanceDispatch.Allocation.Entity.Zone;
import AmbulanceDispatch.Allocation.Entity.ZoneDistance;
import AmbulanceDispatch.Allocation.Repository.AmbulanceRepository;
import AmbulanceDispatch.Allocation.Repository.EmergencyCallRepository;
import AmbulanceDispatch.Allocation.Repository.ZoneDistanceRepository;
import AmbulanceDispatch.Allocation.Repository.ZoneRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmergencyCallService {

    private final EmergencyCallRepository callRepository;
    private final ZoneRepository zoneRepository;
    private final AmbulanceRepository ambulanceRepository;
    private final ZoneDistanceRepository distanceRepository;

    public EmergencyCallService(EmergencyCallRepository callRepository,
                                ZoneRepository zoneRepository,
                                AmbulanceRepository ambulanceRepository,
                                ZoneDistanceRepository distanceRepository) {
        this.callRepository = callRepository;
        this.zoneRepository = zoneRepository;
        this.ambulanceRepository = ambulanceRepository;
        this.distanceRepository = distanceRepository;
    }

    public EmergencyCall addCall(EmergencyCall call) {

        Zone zone = zoneRepository.findById(call.getCallerZone().getId())
                .orElseThrow(() -> new RuntimeException("Caller zone not found"));

        call.setCallerZone(zone);
        call.setStatus("PENDING");

        return callRepository.save(call);
    }

    public List<EmergencyCall> getAllCalls() {
        return callRepository.findAll();
    }

    public String assignAmbulance(int callId) {

        EmergencyCall call = callRepository.findById(callId)
                .orElseThrow(() -> new RuntimeException("Emergency call not found"));

        if (!call.getStatus().equals("PENDING")) {
            throw new RuntimeException("Call is already assigned or completed");
        }

        List<Ambulance> availableAmbulances =
                ambulanceRepository.findByStatus("AVAILABLE");

        Ambulance nearestAmbulance = null;
        int shortestDistance = Integer.MAX_VALUE;

        for (Ambulance ambulance : availableAmbulances) {

            for (ZoneDistance distance : distanceRepository.findAll()) {

                if (distance.getFromZone().getId() ==
                        call.getCallerZone().getId()
                        && distance.getToZone().getId() ==
                        ambulance.getHomeZone().getId()) {

                    if (distance.getDistance() < shortestDistance) {
                        shortestDistance = distance.getDistance();
                        nearestAmbulance = ambulance;
                    }
                }
            }
        }

        if (nearestAmbulance == null) {
            throw new RuntimeException("No available ambulance found");
        }

        nearestAmbulance.setStatus("BUSY");
        ambulanceRepository.save(nearestAmbulance);

        // Remember which ambulance was assigned
        call.setAssignedAmbulance(nearestAmbulance);

        call.setStatus("ASSIGNED");
        callRepository.save(call);

        return "Ambulance " + nearestAmbulance.getVehicleNumber()
                + " assigned to call " + callId;
    }

    public String completeCall(int callId) {

        EmergencyCall call = callRepository.findById(callId)
                .orElseThrow(() -> new RuntimeException("Emergency call not found"));

        if (!call.getStatus().equals("ASSIGNED")) {
            throw new RuntimeException("Call is not currently assigned");
        }

        Ambulance ambulance = call.getAssignedAmbulance();

        ambulance.setStatus("AVAILABLE");
        ambulanceRepository.save(ambulance);

        call.setStatus("COMPLETED");
        callRepository.save(call);

        return "Call " + callId + " completed. Ambulance "
                + ambulance.getVehicleNumber() + " is now available.";
    }
}