package tourmanager;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lag")
public class LagController {

    private final Lag mittLag = new Lag("TestLaget");

    @GetMapping
    public Lag hentLagStatus(){
        return mittLag;
    }

    @PostMapping("/kjop")
    public String kjopRytter(@RequestParam int id){
        RytterController rytterCtrl = new RytterController();
        List<Rytter> alleRyttere = rytterCtrl.hentAlleRyttere();

        Rytter onsketRytter = null;
        for (Rytter r : alleRyttere){
            if (r.getId() == id){
                onsketRytter = r;
                break;
            }
        }
        if (onsketRytter == null){
            return "Noe galt skjedde";
        }

        boolean suksess = mittLag.kjopRytter(onsketRytter);

        if (suksess){
            return "Suksess! " + onsketRytter.getNavn() + " ble lagt til på laget.";
        } else {
            return "Avvist! Sjekk budsjett";
        }
    }
}
