import React, { useState, useEffect, useCallback } from "react"; // Ajoutez useCallback
import { collection, query, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../Firebase";
import styles from "./ReservationList.module.css";

const ReservationList = () => {
  const [reservations, setReservations] = useState([]);
  const [lettiPerOmbrello, setLettiPerOmbrello] = useState({});

  // Générer la liste complète des parasols
  const generateParasolList = () => {
    const parasols = [];
    const sections = ["A", "B", "C", "D"];

    sections.forEach((section) => {
      for (let i = 1; i <= 36; i++) {
        const parasolNumber = `${section}${i}`;
        parasols.push({
          id: parasolNumber,
          numeroOmbrello1: parasolNumber,
          cognome: "",
          nome: "",
          primoGiorno: "",
          ultimoGiorno: "",
          timeday: "",
          email: "",
          telefono: "",
        });
      }
    });
    return parasols;
  };

  // Utilisez useCallback pour organizeReservations
  const organizeReservations = useCallback((reservationData) => {
    const allParasols = generateParasolList();
    const reservationMap = new Map();

    // Pour chaque réservation
    reservationData.forEach((reservation) => {
      [
        { number: reservation.numeroOmbrello1, lettiNumber: 1 },
        { number: reservation.numeroOmbrello2, lettiNumber: 2 },
        { number: reservation.numeroOmbrello3, lettiNumber: 3 },
      ].forEach(({ number, lettiNumber }) => {
        if (number) {
          // Si c'est une réservation matin ou après-midi
          if (reservation.timeday === "M" || reservation.timeday === "P") {
            const emptySlot = {
              ...reservation,
              cognome: "",
              nome: "",
              email: "",
              telefono: "",
              displayedNumber: number,
              lettiNumber,
              timeday: reservation.timeday === "M" ? "P" : "M",
            };

            // Pour le matin, on ajoute la ligne vide après
            if (reservation.timeday === "M") {
              reservationMap.set(`${number}_M`, {
                ...reservation,
                displayedNumber: number,
                lettiNumber,
              });
              reservationMap.set(`${number}_P`, emptySlot);
            }
            // Pour l'après-midi, on ajoute la ligne vide avant
            else {
              reservationMap.set(`${number}_M`, emptySlot);
              reservationMap.set(`${number}_P`, {
                ...reservation,
                displayedNumber: number,
                lettiNumber,
              });
            }
          } else {
            // Journée complète - pas de ligne vide
            reservationMap.set(number, {
              ...reservation,
              displayedNumber: number,
              lettiNumber,
            });
          }
        }
      });
    });

    // Fusion avec la liste complète des parasols
    const organizedData = allParasols.map((parasol) => {
      const fullDayReservation = reservationMap.get(parasol.numeroOmbrello1);
      const morningReservation = reservationMap.get(
        `${parasol.numeroOmbrello1}_M`
      );
      const afternoonReservation = reservationMap.get(
        `${parasol.numeroOmbrello1}_P`
      );

      if (morningReservation || afternoonReservation) {
        return [morningReservation, afternoonReservation];
      }
      return [fullDayReservation || parasol];
    });

    // Aplatir le tableau
    return organizedData.flat().filter(Boolean);
  }, []); // pas de dépendances car la fonction ne dépend d'aucun état

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const q = query(collection(db, "reservations"));
        const querySnapshot = await getDocs(q);
        const reservationData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          // Initialiser lettiPerOmbrello avec les valeurs de la base de données
          setLettiPerOmbrello((prev) => ({
            ...prev,
            [doc.id]: {
              ombrello1: data.lettiOmbrello1 || "2",
              ombrello2: data.lettiOmbrello2 || "2",
              ombrello3: data.lettiOmbrello3 || "2",
            },
          }));
          return {
            id: doc.id,
            ...data,
          };
        });

        // Organiser les données
        const organizedData = organizeReservations(reservationData);
        setReservations(organizedData);
      } catch (error) {
        console.error("Erreur:", error);
      }
    };

    fetchReservations();
  }, [organizeReservations]); // Ajout de la dépendance

  const handleLettiChange = async (reservationId, ombrelloNum, value) => {
    // N'accepte que 2 ou 3
    if (value === "" || value === "2" || value === "3") {
      try {
        // Mise à jour locale
        setLettiPerOmbrello((prev) => ({
          ...prev,
          [reservationId]: {
            ...prev[reservationId],
            [`ombrello${ombrelloNum}`]: value,
          },
        }));

        // Mise à jour Firebase
        const reservationRef = doc(db, "reservations", reservationId);
        await updateDoc(reservationRef, {
          [`lettiOmbrello${ombrelloNum}`]: value || "2", // Valeur par défaut "2"
        });
      } catch (error) {
        console.error("Erreur lors de la mise à jour :", error);
      }
    }
  };

  return (
    <div className={styles.container}>
      <h2>Lista Prenotazione</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>
              Ombrello 1<br />
              <small>Letti (2-3)</small>
            </th>
            <th>Cognome</th>
            <th>Nome</th>
            <th>Primo Giorno</th>
            <th>Ultimo Giorno</th>
            <th>Time Day</th>
            <th>Email</th>
            <th>Telefono</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation, index) => (
            <tr
              key={`${reservation.displayedNumber}_${
                reservation.timeday || "full"
              }_${index}`}
              className={!reservation.cognome ? styles.emptyRow : ""}
            >
              <td>
                <div className={styles.ombrelloCell}>
                  <div>
                    {reservation.displayedNumber}
                    {reservation.timeday ? ` (${reservation.timeday})` : ""}
                  </div>
                  {reservation.cognome && (
                    <input
                      type="text"
                      maxLength="1"
                      pattern="[23]"
                      className={styles.lettiInput}
                      value={
                        lettiPerOmbrello[reservation.id]?.[
                          `ombrello${reservation.lettiNumber}`
                        ] ||
                        reservation[
                          `lettiOmbrello${reservation.lettiNumber}`
                        ] ||
                        "2"
                      }
                      onChange={(e) =>
                        handleLettiChange(
                          reservation.id,
                          reservation.lettiNumber,
                          e.target.value
                        )
                      }
                      placeholder="2"
                    />
                  )}
                </div>
              </td>
              <td>
                <div className={styles.clientInfo}>
                  <span>{reservation.cognome || "-"}</span>
                  {reservation.serialNumber && (
                    <span className={styles.serialNumber}>
                      #{reservation.serialNumber}
                    </span>
                  )}
                </div>
              </td>
              <td>{reservation.nome || "-"}</td>
              <td>{reservation.primoGiorno || "-"}</td>
              <td>{reservation.ultimoGiorno || "-"}</td>
              <td>{reservation.timeday || "-"}</td>
              <td>{reservation.email || "-"}</td>
              <td>{reservation.telefono || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReservationList;
