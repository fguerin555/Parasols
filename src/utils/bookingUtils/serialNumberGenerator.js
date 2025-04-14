import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../../Firebase";

export const generateSerialNumber = async () => {
  try {
    const q = query(
      collection(db, "reservations"),
      where("status", "==", "active"),
      orderBy("serialNumber", "desc"),
      limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return "25000001"; // Format avec 8 chiffres
    }

    const lastDoc = querySnapshot.docs[0].data();
    const lastSerial =
      lastDoc.serialNumber || lastDoc.serialnumber || "25000000";
    const nextNumber = parseInt(lastSerial) + 1;

    // Formatage avec 8 chiffres (25 + 6 chiffres)
    return nextNumber.toString().padStart(8, "0");
  } catch (error) {
    console.error("Erreur génération numéro de série:", error);
    throw new Error("Impossible de générer un numéro de série");
  }
};
