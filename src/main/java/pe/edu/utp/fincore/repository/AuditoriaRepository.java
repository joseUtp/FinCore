package pe.edu.utp.fincore.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.utp.fincore.model.Auditoria;

public interface AuditoriaRepository extends JpaRepository<Auditoria, Long> {
}
