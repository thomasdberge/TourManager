import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.InputStream;
import java.util.Arrays;
import java.util.List;

public class Main {
    public static void main(String[] args) {

        ObjectMapper mapper = new ObjectMapper();

        try {
            InputStream fil = Main.class.getResourceAsStream("/ryttere.json");

            Rytter[] rytterArray = mapper.readValue(fil, Rytter[].class);
            List<Rytter> alleRyttere = Arrays.asList(rytterArray);

            System.out.println("--- TOURMANAGER STARTET ---");
            System.out.println("Fant " + alleRyttere.size() + " ryttere i databasen:");

            for (Rytter rytter : alleRyttere) {
                System.out.println(rytter.toString());
            }
        } catch (Exception e) {
            System.out.println("Klarte ikke lese JSON-filen");
            e.printStackTrace();
        }
    }
}
