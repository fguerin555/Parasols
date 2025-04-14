import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../Firebase";

const CABINA_LETTERS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "W",
  "X",
  "Y",
  "Z",
];

export const getNextCabinaLetter = async (date) => {
  try {
    const reservationsRef = collection(db, "reservations");
    const q = query(reservationsRef, where("status", "==", "active"));

    const querySnapshot = await getDocs(q);
    const usedCabinas = new Set();

    // Amélioration du filtrage des dates
    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      // Conversion des dates en objets Date pour comparaison
      const reservationStart = new Date(data.primoGiorno);
      const reservationEnd = new Date(data.ultimoGiorno);
      const checkDate = new Date(date);

      if (
        reservationStart <= checkDate &&
        reservationEnd >= checkDate &&
        data.cabinaLetter
      ) {
        usedCabinas.add(data.cabinaLetter);
        console.log(
          `Cabine ${data.cabinaLetter} utilisée du ${data.primoGiorno} au ${data.ultimoGiorno}`
        );
      }
    });

    // Tri des cabines utilisées pour debug
    const sortedCabinas = Array.from(usedCabinas).sort();
    console.log("Cabines déjà attribuées:", sortedCabinas);

    // Recherche de la première lettre disponible
    const nextLetter = CABINA_LETTERS.find(
      (letter) => !usedCabinas.has(letter)
    );

    if (!nextLetter) {
      throw new Error("Toutes les cabines sont occupées pour cette date");
    }

    console.log(`Attribution de la cabine ${nextLetter} pour la date ${date}`);
    return nextLetter;
  } catch (error) {
    console.error("Erreur lors de l'attribution de la cabine:", error);
    throw error;
  }
};

export const checkCabinaAvailability = async (date) => {
  try {
    const reservationsRef = collection(db, "reservations");
    const q = query(reservationsRef, where("status", "==", "active"));

    const querySnapshot = await getDocs(q);
    const usedCabinas = new Set();

    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const reservationStart = new Date(data.primoGiorno);
      const reservationEnd = new Date(data.ultimoGiorno);
      const checkDate = new Date(date);

      if (
        reservationStart <= checkDate &&
        reservationEnd >= checkDate &&
        data.cabinaLetter
      ) {
        usedCabinas.add(data.cabinaLetter);
      }
    });

    console.log(`${usedCabinas.size} cabines utilisées pour la date ${date}`);
    return usedCabinas.size < CABINA_LETTERS.length;
  } catch (error) {
    console.error("Erreur lors de la vérification des cabines:", error);
    throw error;
  }
};
