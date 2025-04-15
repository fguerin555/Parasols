import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../Firebase";
import styles from "./ReservationList.module.css";

const getLettiniCount = (parasol) => {
  const reservation = parasol.reservation;
  if (!reservation) return "-";

  // Trouver le numéro de lettino correspondant au parasol
  if (reservation.numeroOmbrello1 === parasol.numero) {
    return reservation.lettiOmbrello1 || "2";
  }
  if (reservation.numeroOmbrello2 === parasol.numero) {
    return reservation.lettiOmbrello2 || "2";
  }
  if (reservation.numeroOmbrello3 === parasol.numero) {
    return reservation.lettiOmbrello3 || "2";
  }
  return "-";
};

const getCabinaLetter = (parasol) => {
  const reservation = parasol.reservation;
  if (!reservation) return "-";

  if (reservation.numeroOmbrello1 === parasol.numero) {
    return reservation.cabinaLetter1 || "-";
  }
  if (reservation.numeroOmbrello2 === parasol.numero) {
    return reservation.cabinaLetter2 || "-";
  }
  if (reservation.numeroOmbrello3 === parasol.numero) {
    return reservation.cabinaLetter3 || "-";
  }
  return "-";
};

const ReservationList = () => {
  const [displayParasols, setDisplayParasols] = useState([]);
  const [allParasols, setAllParasols] = useState([]);

  // Générer tous les numéros de parasols possibles
  useEffect(() => {
    const sections = ["A", "B", "C", "D"];
    const parasols = [];

    sections.forEach((section) => {
      for (let i = 1; i <= 36; i++) {
        parasols.push({
          numero: `${section}${i}`,
          reservation: null,
        });
      }
    });

    setAllParasols(parasols);
  }, []);

  // Récupérer les réservations
  useEffect(() => {
    const fetchReservations = async () => {
      const q = query(
        collection(db, "reservations"),
        where("status", "==", "active")
      );

      const querySnapshot = await getDocs(q);
      const reservationsData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reservationsData.push({ id: doc.id, ...data });
      });

      // Mettre à jour les parasols avec les réservations
      const updatedParasols = allParasols.map((parasol) => {
        const reservation = reservationsData.find(
          (res) =>
            res.numeroOmbrello1 === parasol.numero ||
            res.numeroOmbrello2 === parasol.numero ||
            res.numeroOmbrello3 === parasol.numero
        );
        return {
          ...parasol,
          reservation: reservation || null,
        };
      });

      // Modification du tri des parasols
      const displayRows = [];
      updatedParasols.forEach((parasol) => {
        const existingReservations = reservationsData.filter(
          (res) =>
            res.numeroOmbrello1 === parasol.numero ||
            res.numeroOmbrello2 === parasol.numero ||
            res.numeroOmbrello3 === parasol.numero
        );

        if (existingReservations.length === 0) {
          // Pas de réservation
          displayRows.push(parasol);
        } else {
          // Ajouter une ligne pour chaque réservation
          existingReservations.forEach((reservation) => {
            displayRows.push({
              ...parasol,
              reservation: reservation,
            });
          });
        }
      });

      // Tri des parasols par section (A, B, C, D) puis par numéro
      displayRows.sort((a, b) => {
        const [letterA, numA] = a.numero.match(/([A-D])(\d+)/).slice(1);
        const [letterB, numB] = b.numero.match(/([A-D])(\d+)/).slice(1);
        if (letterA === letterB) {
          return parseInt(numA) - parseInt(numB);
        }
        return letterA.localeCompare(letterB);
      });

      setDisplayParasols(displayRows);
    };

    fetchReservations();
  }, [allParasols]);

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Ombrello</th>
            <th>Lettini</th> {/* Nouvelle colonne */}
            <th>Cabina</th>
            <th>Cliente</th>
            <th>Primo Giorno</th>
            <th>Ultimo Giorno</th>
            <th>Email</th>
            <th>Telefono</th>
          </tr>
        </thead>
        <tbody>
          {displayParasols.map((parasol, index) => (
            <tr
              key={`${parasol.numero}-${index}`}
              className={`${parasol.reservation ? "" : styles.emptyRow} ${
                parasol.isExtra ? styles.extraRow : ""
              }`}
            >
              <td className={styles.ombrelloCell}>{parasol.numero}</td>
              <td>
                {parasol.reservation ? getLettiniCount(parasol) : "-"}
              </td>{" "}
              {/* Nouvelle cellule */}
              <td>{getCabinaLetter(parasol)}</td>
              <td className={styles.clientInfo}>
                {parasol.isExtra
                  ? "Disponible"
                  : parasol.reservation
                  ? `${parasol.reservation.cognome} ${
                      parasol.reservation.nome
                    } ${
                      parasol.reservation.timeday
                        ? `(${parasol.reservation.timeday})`
                        : ""
                    }`
                  : "Disponibile"}
              </td>
              <td>{parasol.reservation?.primoGiorno || "-"}</td>
              <td>{parasol.reservation?.ultimoGiorno || "-"}</td>
              <td>{parasol.reservation?.email || "-"}</td>
              <td>{parasol.reservation?.telefono || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReservationList;
