import React from "react";
// import { Link } from "react-router-dom";
import "../../Global.css";
import styles from "./Booking.module.css";

const handleInputChange = (e) => {
  const value = e.target.value.toUpperCase();
  if (!["I", "M", "P"].includes(value)) {
    e.target.value = "";
  }
};
const Booking = () => {
  return (
    <div>
      <div className={styles.BookingPage}>
        <div className={styles.BookingForm}>
          <div className={styles.Names}>
            <p>Cognome : </p>
            <input
              type="text"
              placeholder="Cognome Cliente"
              id="Firstname"
              maxlength="25"
            />

            <p>Nome : </p>
            <input
              type="text"
              placeholder="Nome Cliente"
              maxlength="25"
              id="Surname"
            />
          </div>

          <div className={styles.MailPhone}>
            <p>Email : </p>
            <input type="text" id="email" placeholder=" Email Cliente" />

            <p>Telefono : </p>
            <input type="tel" id="phone" placeholder=" Phone Cliente" />
          </div>

          <div className={styles.Booking}>
            <p>Primo giorno : </p>
            <input type="date" name="check-in" id="checkin" />

            <p>Ultimo giorno: </p>
            <input type="date" name="checkout" id="checkout" />
          </div>

          <div className={styles.WholeMorningAfternoon}>
            <span></span>
            <span></span>
            <p>Giorno Intero : "I"</p>
            <p> Mattina : "M" </p>
            <p>Pomerrigio "P"</p>
            <input
              type="text"
              maxLength="1"
              pattern="[IMP]"
              id="timeday"
              style={{ textTransform: "uppercase" }}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Booking;
