package tourmanager;

import java.util.ArrayList;
import java.util.List;

public class Lag {
    String managerNavn;
    private int budsjett;
    private List<Rytter> valgteRyttere;

    public Lag(String managerNavn){
        this.managerNavn = managerNavn;
        this.budsjett = 100;
        this.valgteRyttere = new ArrayList<>();
    }

    public boolean kjopRytter(Rytter rytter){
        if(rytter.getPris() > budsjett){
            System.out.println("Du har ikke nok penger til " + rytter.getNavn() + ".");
            return false;
        }
        if(antallFraLag(rytter.getLag()) >= 3){
            System.out.println("Du kan maks ha 3 ryttere fra " + rytter.getLag());
            return false;
        }
        if(!harPlassTilRolle(rytter.getRolle())){
            System.out.println("Du har allerede valgt maks antall fra " + rytter.getRolle() + "-kategorien");
            return false;
        }

        valgteRyttere.add(rytter);
        budsjett -= rytter.getPris();
        System.out.println(rytter.getNavn() + " ble lagt til. Gjenstående budjsett: " + budsjett);
        return true;
    }

    public boolean selgRytter(Rytter rytter){
        if(valgteRyttere.contains(rytter)){
            valgteRyttere.remove(rytter);
            budsjett += rytter.getPris();
            System.out.println("Fjernet " + rytter.getNavn() + ". Gjenstående budsjett: " + budsjett);
            return true;
        }
        else {
            System.out.println("Feil: " + rytter.getNavn() + " er ikke på laget ditt");
            return false;
        }
    }

    private int antallFraLag(String sykkelLag){
        int antall = 0;
        for (Rytter r : valgteRyttere){
            if(r.getLag().equalsIgnoreCase(sykkelLag)){
                antall++;
            }
        }
        return antall;
    }

    private boolean harPlassTilRolle(String rolle){
        int antallIRolle = 0;
        for(Rytter r : valgteRyttere){
            if(r.getRolle().equalsIgnoreCase(rolle)){
                antallIRolle++;
            }
        }
        switch (rolle.toLowerCase()){
            case "lagkaptein": return antallIRolle < 2;
            case "spurter": return antallIRolle < 2;
            case "klatrer": return antallIRolle < 2;
            case "ungdomsrytter": return antallIRolle < 2;
            case "hjelperytter": return antallIRolle < 3;
            case "temporytter": return antallIRolle < 1;
            case "sportsdirektør": return antallIRolle < 1;
            default:
                System.out.println("Ukjent rolle: " + rolle);
                return false;
        }
    }

    public int beregnPoeng(){
        int totalPoeng = 0;

        for (Rytter r : valgteRyttere){
            int rytterPoeng = r.getPoeng();
            if (r.getRolle().equalsIgnoreCase("Lagkaptein")){
                rytterPoeng = rytterPoeng * 2;
                System.out.println(r.getNavn()+" fikk " + rytterPoeng + " poeng.");
            } else {
                System.out.println(r.getNavn() + " dro inn " + rytterPoeng + " poeng.");
            }

            totalPoeng += rytterPoeng;
        }
        return totalPoeng;
    }

    public void printLagStatus(){
        System.out.println("\n--- LAGSTATUS FOR " + managerNavn.toUpperCase() + " ---");
        System.out.println("Budsjett igjen: " + budsjett);
        System.out.println("Antall valgte ryttere: " + valgteRyttere.size() + " / 13");
        System.out.println("Ryttere i stallen:");
        for (Rytter r : valgteRyttere) {
            System.out.println("- " + r.getNavn());
        }
        System.out.println("----------------------------------\n");
    }

    public String getManagerNavn() {
        return managerNavn;
    }

    public int getBudsjett() {
        return budsjett;
    }

    public List<Rytter> getValgteRyttere() {
        return valgteRyttere;
    }
}
