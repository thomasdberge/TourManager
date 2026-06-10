package tourmanager;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.InputStream;
import java.util.Arrays;
import java.util.List;

@RestController
public class RytterController {
    @GetMapping("/api/ryttere")
    public List<Rytter> hentAlleRyttere(){
        ObjectMapper mapper = new ObjectMapper();

        try {
            InputStream fil = getClass().getResourceAsStream("/ryttere.json");
            Rytter[] rytterArray = mapper.readValue(fil, Rytter[].class);
            return Arrays.asList(rytterArray);
        } catch (Exception e){
            e.printStackTrace();
            return null;
        }
    }
}
