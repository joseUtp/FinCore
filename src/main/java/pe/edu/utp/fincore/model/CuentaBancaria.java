package pe.edu.utp.fincore.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cuentas_bancarias")
public class CuentaBancaria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "banco", nullable = false, length = 100)
    private String banco;

    @Column(name = "numero_cuenta", nullable = false, unique = true, length = 50)
    private String numeroCuenta;

    @Column(name = "cci", length = 50)
    private String cci;

    @Enumerated(EnumType.STRING)
    @Column(name = "moneda", nullable = false, length = 10)
    private Moneda moneda = Moneda.PEN;

    @Column(name = "saldo_inicial", nullable = false, precision = 14, scale = 2)
    private BigDecimal saldoInicial = BigDecimal.ZERO;

    @Column(name = "saldo_actual", nullable = false, precision = 14, scale = 2)
    private BigDecimal saldoActual = BigDecimal.ZERO;

    @Column(name = "estado", nullable = false)
    private Boolean estado = true;

    @Column(name = "creado_en", insertable = false, updatable = false)
    private LocalDateTime creadoEn;

    public CuentaBancaria() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBanco() {
        return banco;
    }

    public void setBanco(String banco) {
        this.banco = banco;
    }

    public String getNumeroCuenta() {
        return numeroCuenta;
    }

    public void setNumeroCuenta(String numeroCuenta) {
        this.numeroCuenta = numeroCuenta;
    }

    public String getCci() {
        return cci;
    }

    public void setCci(String cci) {
        this.cci = cci;
    }

    public Moneda getMoneda() {
        return moneda;
    }

    public void setMoneda(Moneda moneda) {
        this.moneda = moneda;
    }

    public BigDecimal getSaldoInicial() {
        return saldoInicial;
    }

    public void setSaldoInicial(BigDecimal saldoInicial) {
        this.saldoInicial = saldoInicial;
    }

    public BigDecimal getSaldoActual() {
        return saldoActual;
    }

    public void setSaldoActual(BigDecimal saldoActual) {
        this.saldoActual = saldoActual;
    }

    public Boolean getEstado() {
        return estado;
    }

    public void setEstado(Boolean estado) {
        this.estado = estado;
    }

    public LocalDateTime getCreadoEn() {
        return creadoEn;
    }

    public void setCreadoEn(LocalDateTime creadoEn) {
        this.creadoEn = creadoEn;
    }
}
