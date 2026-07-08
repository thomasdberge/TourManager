package tourmanager;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Optional;

@Service
public class RytterService {

    private final List<Rytter> ryttere;

    public RytterService(ObjectMapper mapper) throws IOException {
        try (InputStream fil = getClass().getResourceAsStream("/ryttere.json")) {
            this.ryttere = List.of(mapper.readValue(fil, Rytter[].class));
        }
    }

    public List<Rytter> hentAlle() {
        return ryttere;
    }

    public Optional<Rytter> finnById(int id) {
        return ryttere.stream()
                .filter(r -> r.getId() == id)
                .findFirst();
    }
}