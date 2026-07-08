package tourmanager;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.InputStream;
import java.util.Arrays;
import java.util.List;

@RestController
public class RytterController {

    private final RytterService rytterService;

    public RytterController(RytterService rytterService) {
        this.rytterService = rytterService;
    }

    @GetMapping("/api/ryttere")
    public List<Rytter> hentAlleRyttere() {
        return rytterService.hentAlle();
    }
}
