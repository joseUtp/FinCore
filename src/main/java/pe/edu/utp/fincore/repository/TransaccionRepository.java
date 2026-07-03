package pe.edu.utp.fincore.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.utp.fincore.model.Transaccion;
import java.util.List;

public interface TransaccionRepository extends JpaRepository<Transaccion, Long> {
    List<Transaccion> findTop10ByOrderByCreadoEnDesc();
}
