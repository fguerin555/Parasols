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
    // Récupérer toutes les réservations actives pour cette date
    const reservationsRef = collection(db, "reservations");
    const q = query(
      reservationsRef,
      where("status", "==", "active"),
      where("primoGiorno", "==", date)
    );

    const querySnapshot = await getDocs(q);

    // Collecter toutes les lettres de cabine déjà utilisées
    const usedLetters = new Set();
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.cabinaLetter1 && data.cabinaLetter1 !== "-")
        usedLetters.add(data.cabinaLetter1);
      if (data.cabinaLetter2 && data.cabinaLetter2 !== "-")
        usedLetters.add(data.cabinaLetter2);
      if (data.cabinaLetter3 && data.cabinaLetter3 !== "-")
        usedLetters.add(data.cabinaLetter3);
    });

    // Liste des lettres disponibles
    const allLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

    // Trouver la première lettre non utilisée
    for (let letter of allLetters) {
      if (!usedLetters.has(letter)) {
        return letter;
      }
    }

    // Si toutes les lettres sont utilisées, retourner null ou lancer une erreur
    throw new Error("Toutes les cabines sont occupées pour cette date");
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
