package pe.edu.utp.fincore.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.utp.fincore.model.CuentaBancaria;

public interface CuentaBancariaRepository extends JpaRepository<CuentaBancaria, Long> {
}
