package pe.edu.utp.fincore.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.utp.fincore.model.Comprobante;

public interface ComprobanteRepository extends JpaRepository<Comprobante, Long> {
}
