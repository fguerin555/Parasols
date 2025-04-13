import React, { useState } from "react";
import { db } from "../../Firebase";
import { collection, addDoc } from "firebase/firestore";
import "../../Global.css";
import styles from "./Booking.module.css";

// Ajoutez cette fonction au début du composant pour capitaliser
const capitalize = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const Booking = () => {
  // États pour les champs du formulaire
  const [formData, setFormData] = useState({
    cognome: "",
    nome: "",
    email: "",
    telefono: "",
    primoGiorno: new Date().toISOString().split("T")[0],
    ultimoGiorno: new Date().toISOString().split("T")[0],
    timeday: "",
    numeroOmbrello1: "", // Vide par défaut
    numeroOmbrello2: "", // Vide par défaut
    numeroOmbrello3: "", // Vide par défaut
    lettiOmbrello1: "2",
    lettiOmbrello2: "2",
    lettiOmbrello3: "2",
  });

  // Gestion des changements dans les inputs
  const handleChange = (e) => {
    const { id, value } = e.target;

    // Gestion spéciale pour Cognome et Nome
    if (id === "cognome" || id === "nome") {
      setFormData((prev) => ({
        ...prev,
        [id]: capitalize(value),
      }));
      return;
    }

    // Gestion spéciale pour les dates
    if (id === "primoGiorno") {
      setFormData((prev) => ({
        ...prev,
        primoGiorno: value,
        ultimoGiorno: prev.ultimoGiorno < value ? value : prev.ultimoGiorno,
      }));
      return;
    }

    if (id === "ultimoGiorno") {
      if (value < formData.primoGiorno) {
        alert("La date de fin ne peut pas être antérieure à la date de début");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        ultimoGiorno: value,
      }));
      return;
    }

    // Gestion par défaut pour les autres champs
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

  // Remplacez la fonction handleLettiChange existante par celle-ci :
  const handleLettiChange = (e) => {
    const { id, value } = e.target;

    // Accepte uniquement les valeurs 2 ou 3
    if (value === "" || value === "2" || value === "3") {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
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
        lettiOmbrello1: formData.lettiOmbrello1,
        lettiOmbrello2: formData.numeroOmbrello2
          ? formData.lettiOmbrello2
          : null,
        lettiOmbrello3: formData.numeroOmbrello3
          ? formData.lettiOmbrello3
          : null,
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
        primoGiorno: new Date().toISOString().split("T")[0],
        ultimoGiorno: new Date().toISOString().split("T")[0],
        timeday: "",
        numeroOmbrello1: "",
        numeroOmbrello2: "",
        numeroOmbrello3: "",
        lettiOmbrello1: "2",
        lettiOmbrello2: "2",
        lettiOmbrello3: "2",
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
            <p>Giorno Intero : "I"</p>
            <p>Mattina : "M" / Pomerrigio "P"</p>
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
            <p>A1-A36, B1-B36, C1-C36, D1-D36</p>
            <div className={styles.OmbrelloInputs}>
              <div className={styles.ombrelloGroup}>
                <input
                  type="text"
                  id="numeroOmbrello1"
                  placeholder="" // Placeholder vide
                  maxLength="3"
                  style={{ textTransform: "uppercase" }}
                  value={formData.numeroOmbrello1}
                  onChange={handleOmbrelloChange}
                />
              </div>
              <div className={styles.ombrelloGroup}>
                <input
                  type="text"
                  id="numeroOmbrello2"
                  placeholder="" // Placeholder vide
                  maxLength="3"
                  style={{ textTransform: "uppercase" }}
                  value={formData.numeroOmbrello2}
                  onChange={handleOmbrelloChange}
                />
              </div>
              <div className={styles.ombrelloGroup}>
                <input
                  type="text"
                  id="numeroOmbrello3"
                  placeholder="" // Placeholder vide
                  maxLength="3"
                  style={{ textTransform: "uppercase" }}
                  value={formData.numeroOmbrello3}
                  onChange={handleOmbrelloChange}
                />
              </div>
            </div>
            <p className={styles.lettiniTitle}>Lettini</p>
            <div className={styles.OmbrelloInputs}>
              <div className={styles.ombrelloGroup}>
                <input
                  type="text"
                  id="lettiOmbrello1"
                  maxLength="1"
                  pattern="[23]"
                  value={formData.lettiOmbrello1}
                  onChange={handleLettiChange}
                  placeholder="2-3"
                />
              </div>
              <div className={styles.ombrelloGroup}>
                <input
                  type="text"
                  id="lettiOmbrello2"
                  maxLength="1"
                  pattern="[23]"
                  value={formData.lettiOmbrello2}
                  onChange={handleLettiChange}
                  placeholder="2-3"
                />
              </div>
              <div className={styles.ombrelloGroup}>
                <input
                  type="text"
                  id="lettiOmbrello3"
                  maxLength="1"
                  pattern="[23]"
                  value={formData.lettiOmbrello3}
                  onChange={handleLettiChange}
                  placeholder="2-3"
                />
              </div>
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
