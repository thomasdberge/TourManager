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

            System.out.println("\nStarter laguttak...");

            Lag mittlag = new Lag("Test-Team");

            Rytter onsketRytter1 = alleRyttere.get(0);
            mittlag.kjopRytter(onsketRytter1);

            Rytter onsketRytter2 = alleRyttere.get(1);
            mittlag.kjopRytter(onsketRytter2);

            mittlag.selgRytter(onsketRytter2);

            Rytter onsketRytter3 = alleRyttere.get(2);
            mittlag.kjopRytter(onsketRytter3);

            mittlag.printLagStatus();

            System.out.println("\n--- SIMULERER ETAPPE 1 ---");

            onsketRytter1.setPoeng(100);
            onsketRytter3.setPoeng(50);

            int lagetsScore = mittlag.beregnPoeng();
            System.out.println("\nTotale poeng for " + mittlag.managerNavn + " etter Etappe 1: " + lagetsScore);

        } catch (Exception e) {
            System.out.println("Klarte ikke lese JSON-filen");
            e.printStackTrace();
        }
    }
}
