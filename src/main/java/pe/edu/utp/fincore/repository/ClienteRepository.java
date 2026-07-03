package pe.edu.utp.fincore.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.utp.fincore.model.Cliente;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
}
