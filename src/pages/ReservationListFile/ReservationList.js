import React, { useState, useEffect } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../../Firebase";
import styles from "./ReservationList.module.css";

const ReservationList = () => {
  const [reservations, setReservations] = useState([]);
  const [lettiPerOmbrello, setLettiPerOmbrello] = useState({});

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const q = query(collection(db, "reservations"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReservations(data);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des réservations:",
          error
        );
      }
    };

    fetchReservations();
  }, []);

  const handleLettiChange = (reservationId, ombrelloNum, value) => {
    // Accepte uniquement les valeurs 2 ou 3
    if (value === "" || value === "2" || value === "3") {
      setLettiPerOmbrello((prev) => ({
        ...prev,
        [reservationId]: {
          ...prev[reservationId],
          [`ombrello${ombrelloNum}`]: value,
        },
      }));
    }
  };

  return (
    <div className={styles.container}>
      <h2>Lista Prenotazione</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>
              Ombrello 1
              <br />
              <small>Letti (2-3)</small>
            </th>
            <th>
              Ombrello 2
              <br />
              <small>Letti (2-3)</small>
            </th>
            <th>
              Ombrello 3
              <br />
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
          {reservations.map((reservation) => (
            <tr key={reservation.id}>
              <td>
                <div className={styles.ombrelloCell}>
                  <div>{reservation.numeroOmbrello1}</div>
                  <input
                    type="text"
                    maxLength="1"
                    pattern="[23]"
                    className={styles.lettiInput}
                    value={lettiPerOmbrello[reservation.id]?.ombrello1 || ""}
                    onChange={(e) =>
                      handleLettiChange(reservation.id, 1, e.target.value)
                    }
                    placeholder="2-3"
                  />
                </div>
              </td>
              <td>
                <div className={styles.ombrelloCell}>
                  <div>{reservation.numeroOmbrello2}</div>
                  <input
                    type="text"
                    maxLength="1"
                    pattern="[23]"
                    className={styles.lettiInput}
                    value={lettiPerOmbrello[reservation.id]?.ombrello2 || ""}
                    onChange={(e) =>
                      handleLettiChange(reservation.id, 2, e.target.value)
                    }
                    placeholder="2-3"
                  />
                </div>
              </td>
              <td>
                <div className={styles.ombrelloCell}>
                  <div>{reservation.numeroOmbrello3}</div>
                  <input
                    type="text"
                    maxLength="1"
                    pattern="[23]"
                    className={styles.lettiInput}
                    value={lettiPerOmbrello[reservation.id]?.ombrello3 || ""}
                    onChange={(e) =>
                      handleLettiChange(reservation.id, 3, e.target.value)
                    }
                    placeholder="2-3"
                  />
                </div>
              </td>
              <td>{reservation.cognome}</td>
              <td>{reservation.nome}</td>
              <td>{reservation.primoGiorno}</td>
              <td>{reservation.ultimoGiorno}</td>
              <td>{reservation.timeday}</td>
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
