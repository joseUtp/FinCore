package pe.edu.utp.fincore.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.utp.fincore.model.Proveedor;

public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {
}
