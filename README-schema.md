# Så uppdaterar du bokningsschemat

Alla tider finns i filen **[tider.txt](tider.txt)**. Instruktionerna står överst i filen.

Kort version:

1. Öppna `tider.txt` på GitHub och klicka på pennan (Edit).
2. Lägg till en rad per tid: `2026-12-12  10:00  30,45  ledig`
   - `30` = Teknikpass 30 min, `45` = Nybörjarlektion 45 min, `60` = Grupp 60 min
   - status: `ledig` eller `bokad`
3. Klicka **Commit changes**. Sidan uppdateras inom några minuter.

Bokningsformuläret skickar ingenting ännu. En bokad tid tas därför inte bort automatiskt.
Ändra `ledig` till `bokad` när du har bekräftat en bokning.

Ta bort raden `EXEMPELTIDER` när du har lagt in riktiga tider.

Vill du hellre klicka ihop tiderna kan du använda `admin-tider.html` (sidan syns inte i sökmotorer).
Den gör färdig text som du kopierar in i `tider.txt`.
