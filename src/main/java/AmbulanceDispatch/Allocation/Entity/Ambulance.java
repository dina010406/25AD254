package AmbulanceDispatch.Allocation.Entity;

import jakarta.persistence.*;

@Entity
public class Ambulance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String vehicleNumber;

    @ManyToOne
    private Zone homeZone;

    private String status;

    public int getId() {
        return id;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public Zone getHomeZone() {
        return homeZone;
    }

    public void setHomeZone(Zone homeZone) {
        this.homeZone = homeZone;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}