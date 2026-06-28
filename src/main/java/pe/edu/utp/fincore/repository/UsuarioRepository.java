package pe.edu.utp.fincore.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.edu.utp.fincore.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
}
