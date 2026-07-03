package pe.edu.utp.fincore.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "auditorias")
public class Auditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(name = "modulo", nullable = false, length = 80)
    private String modulo;

    @Column(name = "accion", nullable = false, length = 80)
    private String accion;

    @Column(name = "descripcion", length = 250)
    private String descripcion;

    @Column(name = "ip_origen", length = 45)
    private String ipOrigen;

    @Column(name = "fecha", insertable = false, updatable = false)
    private LocalDateTime fecha;

    public Auditoria() {}

    public Auditoria(Usuario usuario, String modulo, String accion, String descripcion, String ipOrigen) {
        this.usuario = usuario;
        this.modulo = modulo;
        this.accion = accion;
        this.descripcion = descripcion;
        this.ipOrigen = ipOrigen;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getModulo() {
        return modulo;
    }

    public void setModulo(String modulo) {
        this.modulo = modulo;
    }

    public String getAccion() {
        return accion;
    }

    public void setAccion(String accion) {
        this.accion = accion;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getIpOrigen() {
        return ipOrigen;
    }

    public void setIpOrigen(String ipOrigen) {
        this.ipOrigen = ipOrigen;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}
