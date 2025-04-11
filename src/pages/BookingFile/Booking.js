import React, { useState } from "react";
import { db } from "../../Firebase";
import { collection, addDoc } from "firebase/firestore";
import "../../Global.css";
import styles from "./Booking.module.css";

const Booking = () => {
  // États pour les champs du formulaire
  const [formData, setFormData] = useState({
    cognome: "",
    nome: "",
    email: "",
    telefono: "",
    primoGiorno: "",
    ultimoGiorno: "",
    timeday: "",
    numeroOmbrello1: "",
    numeroOmbrello2: "",
    numeroOmbrello3: "",
  });

  // Gestion des changements dans les inputs
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Gestion spéciale pour l'input I/M/P
  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    if (!["I", "M", "P"].includes(value)) {
      e.target.value = "";
      return;
    }
    setFormData((prev) => ({
      ...prev,
      timeday: value,
    }));
  };

  // Après les autres fonctions de gestion
  const handleOmbrelloChange = (e) => {
    const { id, value } = e.target;
    const upperValue = value.toUpperCase();

    // Permet uniquement les caractères valides
    const validChars = /^[A-D0-9]*$/;
    if (!validChars.test(upperValue)) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [id]: upperValue,
    }));
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Données à envoyer:", formData); // Ajoutez cette ligne

    // Validation des champs obligatoires uniquement
    if (
      !formData.cognome ||
      !formData.nome ||
      !formData.primoGiorno ||
      !formData.ultimoGiorno ||
      !formData.timeday ||
      !formData.numeroOmbrello1
    ) {
      alert(
        "Veuillez remplir les champs obligatoires : Nom, Prénom, Dates, période (I/M/P) et au moins un numéro de parasol"
      );
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "reservations"), {
        cognome: formData.cognome,
        nome: formData.nome,
        primoGiorno: formData.primoGiorno,
        ultimoGiorno: formData.ultimoGiorno,
        timeday: formData.timeday,
        numeroOmbrello1: formData.numeroOmbrello1,
        numeroOmbrello2: formData.numeroOmbrello2 || null,
        numeroOmbrello3: formData.numeroOmbrello3 || null,
        // Champs optionnels
        email: formData.email || null,
        telefono: formData.telefono || null,
        dateCreation: new Date(),
        status: "active",
      });

      console.log("Données envoyées avec succès. ID:", docRef.id); // Ajoutez cette ligne
      alert("Réservation enregistrée avec succès!");

      // Réinitialisation du formulaire
      setFormData({
        cognome: "",
        nome: "",
        email: "",
        telefono: "",
        primoGiorno: "",
        ultimoGiorno: "",
        timeday: "",
        numeroOmbrello1: "",
        numeroOmbrello2: "",
        numeroOmbrello3: "",
      });
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      alert("Erreur lors de l'enregistrement de la réservation");
    }
  };

  return (
    <div>
      <div className={styles.BookingPage}>
        <form className={styles.BookingForm} onSubmit={handleSubmit}>
          <div className={styles.Names}>
            <p>Cognome : </p>
            <input
              type="text"
              placeholder="Cognome Cliente"
              id="cognome"
              maxLength="25"
              value={formData.cognome}
              onChange={handleChange}
            />

            <p>Nome : </p>
            <input
              type="text"
              placeholder="Nome Cliente"
              maxLength="25"
              id="nome"
              value={formData.nome}
              onChange={handleChange}
            />
          </div>

          <div className={styles.MailPhone}>
            <p>Email : </p>
            <input
              type="email"
              id="email"
              placeholder="Email Cliente"
              value={formData.email}
              onChange={handleChange}
            />

            <p>Telefono : </p>
            <input
              type="tel"
              id="telefono"
              placeholder="Phone Cliente"
              value={formData.telefono}
              onChange={handleChange}
            />
          </div>

          <div className={styles.Booking}>
            <p>Primo giorno : </p>
            <input
              type="date"
              id="primoGiorno"
              value={formData.primoGiorno}
              onChange={handleChange}
            />

            <p>Ultimo giorno: </p>
            <input
              type="date"
              id="ultimoGiorno"
              value={formData.ultimoGiorno}
              onChange={handleChange}
            />
          </div>

          <div className={styles.WholeMorningAfternoon}>
            <p>Giorno Intero : "I" / Mattina : "M" / Pomerrigio "P"</p>
            <input
              type="text"
              maxLength="1"
              pattern="[IMP]"
              id="timeday"
              style={{ textTransform: "uppercase" }}
              value={formData.timeday}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.OmbrelloSection}>
            <p>Numeri Ombrelli : </p>
            <p>(A1-A36, B1-B36, C1-C36, D1-D36)</p>
            <div className={styles.OmbrelloInputs}>
              <input
                type="text"
                id="numeroOmbrello1"
                placeholder="A1"
                maxLength="3"
                style={{ textTransform: "uppercase" }}
                value={formData.numeroOmbrello1}
                onChange={handleOmbrelloChange}
              />
              <input
                type="text"
                id="numeroOmbrello2"
                placeholder="B1"
                maxLength="3"
                style={{ textTransform: "uppercase" }}
                value={formData.numeroOmbrello2}
                onChange={handleOmbrelloChange}
              />
              <input
                type="text"
                id="numeroOmbrello3"
                placeholder="C1"
                maxLength="3"
                style={{ textTransform: "uppercase" }}
                value={formData.numeroOmbrello3}
                onChange={handleOmbrelloChange}
              />
            </div>
          </div>

          <button type="submit" style={{ marginTop: "1rem" }}>
            Confirmazione
          </button>
        </form>
      </div>
    </div>
  );
};

export default Booking;
