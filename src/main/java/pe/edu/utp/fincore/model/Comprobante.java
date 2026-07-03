package pe.edu.utp.fincore.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comprobantes")
public class Comprobante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaccion_id", nullable = false)
    private Transaccion transaccion;

    @Column(name = "nombre_archivo", nullable = false, length = 180)
    private String nombreArchivo;

    @Column(name = "ruta_archivo", nullable = false, length = 255)
    private String rutaArchivo;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_archivo", nullable = false, length = 20)
    private TipoArchivo tipoArchivo;

    @Column(name = "peso_bytes", nullable = false)
    private Long pesoBytes;

    @Column(name = "subido_en", insertable = false, updatable = false)
    private LocalDateTime subidoEn;

    public Comprobante() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Transaccion getTransaccion() {
        return transaccion;
    }

    public void setTransaccion(Transaccion transaccion) {
        this.transaccion = transaccion;
    }

    public String getNombreArchivo() {
        return nombreArchivo;
    }

    public void setNombreArchivo(String nombreArchivo) {
        this.nombreArchivo = nombreArchivo;
    }

    public String getRutaArchivo() {
        return rutaArchivo;
    }

    public void setRutaArchivo(String rutaArchivo) {
        this.rutaArchivo = rutaArchivo;
    }

    public TipoArchivo getTipoArchivo() {
        return tipoArchivo;
    }

    public void setTipoArchivo(TipoArchivo tipoArchivo) {
        this.tipoArchivo = tipoArchivo;
    }

    public Long getPesoBytes() {
        return pesoBytes;
    }

    public void setPesoBytes(Long pesoBytes) {
        this.pesoBytes = pesoBytes;
    }

    public LocalDateTime getSubidoEn() {
        return subidoEn;
    }

    public void setSubidoEn(LocalDateTime subidoEn) {
        this.subidoEn = subidoEn;
    }
}
