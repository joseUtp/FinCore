package pe.edu.utp.fincore.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.utp.fincore.model.Categoria;
import pe.edu.utp.fincore.model.TipoCategoria;
import java.util.List;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    List<Categoria> findByTipoOrTipo(TipoCategoria tipo1, TipoCategoria tipo2);
}
