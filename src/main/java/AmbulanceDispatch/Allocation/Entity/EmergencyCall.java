package AmbulanceDispatch.Allocation.Entity;

import jakarta.persistence.*;

@Entity
public class EmergencyCall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String callerName;

    private String phoneNumber;

    @ManyToOne
    private Zone callerZone;

    @ManyToOne
    private Ambulance assignedAmbulance;

    private String status;

    public int getId() {
        return id;
    }

    public String getCallerName() {
        return callerName;
    }

    public void setCallerName(String callerName) {
        this.callerName = callerName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public Zone getCallerZone() {
        return callerZone;
    }

    public void setCallerZone(Zone callerZone) {
        this.callerZone = callerZone;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
    public Ambulance getAssignedAmbulance() {
        return assignedAmbulance;
    }

    public void setAssignedAmbulance(Ambulance assignedAmbulance) {
        this.assignedAmbulance = assignedAmbulance;
    }
}