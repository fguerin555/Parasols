import React, { useState, useEffect } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../../Firebase";
import styles from "./ReservationList.module.css";

const ReservationList = () => {
  const [reservations, setReservations] = useState([]);

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

  return (
    <div className={styles.container}>
      <h2>Lista Prenotazione</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Ombrello 1</th>
            <th>Ombrello 2</th>
            <th>Ombrello 3</th>
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
              <td>{reservation.numeroOmbrello1}</td>
              <td>{reservation.numeroOmbrello2}</td>
              <td>{reservation.numeroOmbrello3}</td>
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
