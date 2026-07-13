package tourmanager;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lag")
public class LagController {

    private final Lag mittLag = new Lag("TestLaget");
    private final RytterService rytterService;

    public LagController(RytterService rytterService) {
        this.rytterService = rytterService;
    }

    @GetMapping
    public Lag hentLagStatus() {
        return mittLag;
    }

    @PostMapping("/kjop")
    public ResponseEntity<String> kjopRytter(@RequestParam int id) {
        Rytter onsketRytter = rytterService.finnById(id).orElse(null);

        if (onsketRytter == null) {
            return ResponseEntity.status(404)
                    .body("Fant ingen rytter med id " + id);
        }

        boolean suksess = mittLag.kjopRytter(onsketRytter);

        if (suksess) {
            return ResponseEntity.ok("Suksess! " + onsketRytter.getNavn() + " ble lagt til på laget.");
        } else {
            return ResponseEntity.badRequest().body("Avvist! Sjekk budsjett eller kvoter.");
        }
    }

    @DeleteMapping("/ryttere/{id}")
    public ResponseEntity<String> selgRytter(@PathVariable int id) {
        Rytter rytter = mittLag.getValgteRyttere().stream()
                .filter(r -> r.getId() == id)
                .findFirst()
                .orElse(null);

        if (rytter == null) {
            return ResponseEntity.status(404)
                    .body("Rytter med id " + id + " er ikke på laget ditt.");
        }

        mittLag.selgRytter(rytter);
        return ResponseEntity.ok(rytter.getNavn() + " ble solgt.");
    }
}
