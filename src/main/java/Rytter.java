public class Rytter {
    private int id;
    private String navn;
    private String lag;
    private int pris;
    private String rolle;
    private int poeng;

    public Rytter(){

    }

    public Rytter(int id, String navn, String lag, int pris, String rolle, int poeng){
        this.id = id;
        this.navn = navn;
        this.lag = lag;
        this.pris = pris;
        this.rolle = rolle;
        this.poeng = poeng;
    }
    public int getId() {return id;}
    public void setId(int id) {this.id = id;}

    public String getNavn() {return navn;}
    public void setNavn(String navn) {this.navn = navn;}

    public String getLag() {return lag;}
    public void setLag(String lag) {this.lag = lag;}

    public int getPris() {return pris;}
    public void setPris(int pris) {this.pris = pris;}

    public String getRolle() {return rolle;}
    public void setRolle(String rolle) {this.rolle = rolle;}

    public int getPoeng() {return poeng;}
    public void setPoeng(int poeng) {this.poeng = poeng;}

    @Override
    public String toString(){
        return navn + " (" + rolle + ") - Pris: " + pris + " | Poeng: " + poeng;
    }
}
