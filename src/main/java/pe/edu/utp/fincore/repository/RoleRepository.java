package pe.edu.utp.fincore.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pe.edu.utp.fincore.model.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {
}
